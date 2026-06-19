import { db } from '../../lib/db';
import { AppError } from '../../lib/errors';
import type { CreateSleepLogInput, UpdateSleepLogInput, SleepQueryInput } from './sleep.schemas';

export interface SleepTrends {
  avgDurationMin: number;
  avgQuality: number;
  totalNights: number;
  longestSleepMin: number;
  shortestSleepMin: number;
  consistencyScore: number;
  dailyBreakdown: Array<{
    date: string;
    durationMin: number;
    quality: number;
  }>;
}

export class SleepService {
  async createLog(userId: string, input: CreateSleepLogInput) {
    const bedtime = new Date(input.bedtime);
    const wakeTime = new Date(input.wakeTime);

    if (wakeTime <= bedtime) {
      throw new AppError('wakeTime must be after bedtime', 400);
    }

    const durationMin = Math.round((wakeTime.getTime() - bedtime.getTime()) / 60000);

    return db.sleepLog.create({
      data: {
        userId,
        bedtime,
        wakeTime,
        durationMin,
        quality: input.quality,
        notes: input.notes ?? null,
      },
    });
  }

  async getLogs(userId: string, query: SleepQueryInput) {
    const where: any = { userId };
    if (query.from || query.to) {
      where.bedtime = {};
      if (query.from) where.bedtime.gte = new Date(query.from);
      if (query.to) where.bedtime.lte = new Date(query.to);
    }

    const [data, total] = await Promise.all([
      db.sleepLog.findMany({
        where,
        orderBy: { bedtime: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      db.sleepLog.count({ where }),
    ]);

    return { data, total, limit: query.limit, offset: query.offset };
  }

  async getLog(userId: string, id: string) {
    const log = await db.sleepLog.findFirst({ where: { id, userId } });
    if (!log) throw new AppError('Sleep log not found', 404);
    return log;
  }

  async updateLog(userId: string, id: string, input: UpdateSleepLogInput) {
    const existing = await this.getLog(userId, id);

    const bedtime = input.bedtime ? new Date(input.bedtime) : existing.bedtime;
    const wakeTime = input.wakeTime ? new Date(input.wakeTime) : existing.wakeTime;

    if (wakeTime <= bedtime) {
      throw new AppError('wakeTime must be after bedtime', 400);
    }

    const durationMin = Math.round((wakeTime.getTime() - bedtime.getTime()) / 60000);

    return db.sleepLog.update({
      where: { id },
      data: {
        bedtime,
        wakeTime,
        durationMin,
        quality: input.quality,
        notes: input.notes,
      },
    });
  }

  async deleteLog(userId: string, id: string) {
    await this.getLog(userId, id);
    await db.sleepLog.delete({ where: { id } });
  }

  async getTrends(userId: string, days: number = 30): Promise<SleepTrends> {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const logs = await db.sleepLog.findMany({
      where: { userId, bedtime: { gte: from } },
      orderBy: { bedtime: 'asc' },
    });

    if (logs.length === 0) {
      return {
        avgDurationMin: 0,
        avgQuality: 0,
        totalNights: 0,
        longestSleepMin: 0,
        shortestSleepMin: 0,
        consistencyScore: 0,
        dailyBreakdown: [],
      };
    }

    const totalDuration = logs.reduce((sum, l) => sum + l.durationMin, 0);
    const totalQuality = logs.reduce((sum, l) => sum + l.quality, 0);
    const durations = logs.map((l) => l.durationMin);
    const avgDuration = totalDuration / logs.length;

    // Consistency: std deviation of bedtime hours — lower = more consistent
    const bedtimeHours = logs.map((l) => l.bedtime.getHours() + l.bedtime.getMinutes() / 60);
    const avgBedtime = bedtimeHours.reduce((s, h) => s + h, 0) / bedtimeHours.length;
    const variance = bedtimeHours.reduce((s, h) => s + Math.pow(h - avgBedtime, 2), 0) / bedtimeHours.length;
    const stdDev = Math.sqrt(variance);
    // Score 0-100: stdDev of 0 = 100, stdDev of 3+ = 0
    const consistencyScore = Math.max(0, Math.round(100 - (stdDev / 3) * 100));

    return {
      avgDurationMin: Math.round(avgDuration),
      avgQuality: Math.round((totalQuality / logs.length) * 10) / 10,
      totalNights: logs.length,
      longestSleepMin: Math.max(...durations),
      shortestSleepMin: Math.min(...durations),
      consistencyScore,
      dailyBreakdown: logs.map((l) => ({
        date: l.bedtime.toISOString().split('T')[0],
        durationMin: l.durationMin,
        quality: l.quality,
      })),
    };
  }
}
