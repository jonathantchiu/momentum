import { db } from '../../lib/db';
import { AppError } from '../../lib/errors';
import type {
  CreateWorkoutSessionInput,
  UpdateWorkoutSessionInput,
  AddSetInput,
  ExerciseQueryInput,
  SessionQueryInput,
  ExerciseInput,
} from './fitness.schemas';

export class FitnessService {
  // ─── Exercise Library ───────────────────────────────────────────────

  async getExercises(query: ExerciseQueryInput) {
    const where: any = {};
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
    if (query.category) where.category = query.category;

    const [data, total] = await Promise.all([
      db.exercise.findMany({
        where,
        orderBy: { name: 'asc' },
        take: query.limit,
        skip: query.offset,
      }),
      db.exercise.count({ where }),
    ]);
    return { data, total, limit: query.limit, offset: query.offset };
  }

  async getExercise(id: string) {
    const ex = await db.exercise.findFirst({ where: { id } });
    if (!ex) throw new AppError('Exercise not found', 404);
    return ex;
  }

  async createCustomExercise(userId: string, input: ExerciseInput) {
    return db.exercise.create({
      data: {
        ...input,
        isCustom: true,
        createdById: userId,
      },
    });
  }

  // ─── Workout Sessions ────────────────────────────────────────────────

  async createSession(userId: string, input: CreateWorkoutSessionInput) {
    const startedAt = new Date(input.startedAt);
    const endedAt = input.endedAt ? new Date(input.endedAt) : undefined;
    const durationMin =
      endedAt ? Math.round((endedAt.getTime() - startedAt.getTime()) / 60000) : undefined;

    return db.workoutSession.create({
      data: {
        userId,
        name: input.name,
        startedAt,
        endedAt,
        durationMin,
        notes: input.notes,
        sets: input.sets
          ? {
              create: input.sets.map((s) => ({
                exerciseId: s.exerciseId,
                setNumber: s.setNumber,
                reps: s.reps,
                weightKg: s.weightKg,
                durationSec: s.durationSec,
                distanceM: s.distanceM,
                notes: s.notes,
              })),
            }
          : undefined,
      },
      include: { sets: { include: { exercise: true } } },
    });
  }

  async getSessions(userId: string, query: SessionQueryInput) {
    const where: any = { userId };
    if (query.from || query.to) {
      where.startedAt = {};
      if (query.from) where.startedAt.gte = new Date(query.from);
      if (query.to) where.startedAt.lte = new Date(query.to);
    }

    const [data, total] = await Promise.all([
      db.workoutSession.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        take: query.limit,
        skip: query.offset,
        include: { sets: { include: { exercise: true } } },
      }),
      db.workoutSession.count({ where }),
    ]);
    return { data, total, limit: query.limit, offset: query.offset };
  }

  async getSession(userId: string, id: string) {
    const session = await db.workoutSession.findFirst({
      where: { id, userId },
      include: { sets: { include: { exercise: true }, orderBy: [{ setNumber: 'asc' }] } },
    });
    if (!session) throw new AppError('Workout session not found', 404);
    return session;
  }

  async updateSession(userId: string, id: string, input: UpdateWorkoutSessionInput) {
    await this.getSession(userId, id);
    const startedAt = input.startedAt ? new Date(input.startedAt) : undefined;
    const endedAt = input.endedAt ? new Date(input.endedAt) : undefined;
    let durationMin: number | undefined;
    if (startedAt && endedAt) {
      durationMin = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);
    }
    return db.workoutSession.update({
      where: { id },
      data: { name: input.name, startedAt, endedAt, durationMin, notes: input.notes },
      include: { sets: { include: { exercise: true } } },
    });
  }

  async deleteSession(userId: string, id: string) {
    await this.getSession(userId, id);
    await db.workoutSession.delete({ where: { id } });
  }

  async addSet(userId: string, sessionId: string, input: AddSetInput) {
    await this.getSession(userId, sessionId);
    await this.getExercise(input.exerciseId);
    const set = await db.workoutSet.create({
      data: { sessionId, ...input },
      include: { exercise: true },
    });
    // Check for PR after adding set
    if (input.weightKg && input.reps) {
      await this.checkAndUpdatePR(userId, input.exerciseId, {
        weightKg: input.weightKg,
        reps: input.reps,
        distanceM: input.distanceM,
        durationSec: input.durationSec,
      });
    }
    return set;
  }

  // ─── Personal Records ────────────────────────────────────────────────

  async checkAndUpdatePR(
    userId: string,
    exerciseId: string,
    data: { weightKg?: number; reps?: number; distanceM?: number; durationSec?: number }
  ) {
    const existing = await db.personalRecord.findFirst({
      where: { userId, exerciseId },
    });

    const isNewPR =
      !existing ||
      (data.weightKg !== undefined && existing.weightKg !== null && data.weightKg > existing.weightKg) ||
      (data.distanceM !== undefined && existing.distanceM !== null && data.distanceM > existing.distanceM);

    if (isNewPR) {
      await db.personalRecord.upsert({
        where: { id: existing?.id ?? '' },
        create: { userId, exerciseId, ...data, achievedAt: new Date() },
        update: { ...data, achievedAt: new Date() },
      });
    }
  }

  async getPersonalRecords(userId: string) {
    return db.personalRecord.findMany({
      where: { userId },
      include: { exercise: true },
      orderBy: { achievedAt: 'desc' },
    });
  }

  async getWorkoutStats(userId: string, days: number = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const sessions = await db.workoutSession.findMany({
      where: { userId, startedAt: { gte: from } },
      include: { sets: true },
    });

    const totalSessions = sessions.length;
    const totalDurationMin = sessions.reduce((sum, s) => sum + (s.durationMin ?? 0), 0);
    const totalSets = sessions.reduce((sum, s) => sum + s.sets.length, 0);
    const totalVolume = sessions.reduce(
      (sum, s) =>
        sum +
        s.sets.reduce(
          (sv, set) => sv + (set.weightKg ?? 0) * (set.reps ?? 1),
          0
        ),
      0
    );

    return {
      totalSessions,
      totalDurationMin,
      totalSets,
      totalVolumeKg: Math.round(totalVolume),
      avgSessionDurationMin: totalSessions > 0 ? Math.round(totalDurationMin / totalSessions) : 0,
    };
  }
}
