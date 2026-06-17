import { db } from '../../lib/db';
import { AppError } from '../../lib/errors';
import type { CreateBodyMetricInput, UpdateBodyMetricInput, BodyMetricQueryInput } from './bodyMetrics.schemas';

export class BodyMetricsService {
  async createMetric(userId: string, input: CreateBodyMetricInput) {
    return db.bodyMetric.create({
      data: {
        userId,
        recordedAt: new Date(input.recordedAt),
        weightKg: input.weightKg,
        bodyFatPct: input.bodyFatPct,
        muscleMassKg: input.muscleMassKg,
        waterPct: input.waterPct,
        bmi: input.bmi,
        waistCm: input.waistCm,
        hipCm: input.hipCm,
        chestCm: input.chestCm,
        armCm: input.armCm,
        thighCm: input.thighCm,
        notes: input.notes,
      },
    });
  }

  async getMetrics(userId: string, query: BodyMetricQueryInput) {
    const where: any = { userId };
    if (query.from || query.to) {
      where.recordedAt = {};
      if (query.from) where.recordedAt.gte = new Date(query.from);
      if (query.to) where.recordedAt.lte = new Date(query.to);
    }
    const [data, total] = await Promise.all([
      db.bodyMetric.findMany({
        where,
        orderBy: { recordedAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      db.bodyMetric.count({ where }),
    ]);
    return { data, total, limit: query.limit, offset: query.offset };
  }

  async getMetric(userId: string, id: string) {
    const metric = await db.bodyMetric.findFirst({ where: { id, userId } });
    if (!metric) throw new AppError('Body metric not found', 404);
    return metric;
  }

  async updateMetric(userId: string, id: string, input: UpdateBodyMetricInput) {
    await this.getMetric(userId, id);
    return db.bodyMetric.update({
      where: { id },
      data: {
        recordedAt: input.recordedAt ? new Date(input.recordedAt) : undefined,
        weightKg: input.weightKg,
        bodyFatPct: input.bodyFatPct,
        muscleMassKg: input.muscleMassKg,
        waterPct: input.waterPct,
        bmi: input.bmi,
        waistCm: input.waistCm,
        hipCm: input.hipCm,
        chestCm: input.chestCm,
        armCm: input.armCm,
        thighCm: input.thighCm,
        notes: input.notes,
      },
    });
  }

  async deleteMetric(userId: string, id: string) {
    await this.getMetric(userId, id);
    await db.bodyMetric.delete({ where: { id } });
  }

  async getProgress(userId: string, days: number = 90) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const metrics = await db.bodyMetric.findMany({
      where: { userId, recordedAt: { gte: from } },
      orderBy: { recordedAt: 'asc' },
    });

    if (metrics.length === 0) {
      return {
        totalReadings: 0,
        weightChangKg: 0,
        bodyFatChangePct: 0,
        latestWeight: null,
        latestBodyFat: null,
        latestBmi: null,
        trend: [],
      };
    }

    const first = metrics[0];
    const last = metrics[metrics.length - 1];

    return {
      totalReadings: metrics.length,
      weightChangKg:
        first.weightKg !== null && last.weightKg !== null
          ? Math.round((last.weightKg - first.weightKg) * 10) / 10
          : 0,
      bodyFatChangePct:
        first.bodyFatPct !== null && last.bodyFatPct !== null
          ? Math.round((last.bodyFatPct - first.bodyFatPct) * 10) / 10
          : 0,
      latestWeight: last.weightKg,
      latestBodyFat: last.bodyFatPct,
      latestBmi: last.bmi,
      trend: metrics.map((m) => ({
        date: m.recordedAt.toISOString().split('T')[0],
        weightKg: m.weightKg,
        bodyFatPct: m.bodyFatPct,
        bmi: m.bmi,
      })),
    };
  }
}
