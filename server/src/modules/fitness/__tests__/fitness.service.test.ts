import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FitnessService } from '../fitness.service';
import { db } from '../../../lib/db';
import { AppError } from '../../../lib/errors';

vi.mock('../../../lib/db', () => ({
  db: {
    exercise: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    workoutSession: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    workoutSet: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    personalRecord: {
      findFirst: vi.fn(),
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('FitnessService', () => {
  let service: FitnessService;
  const userId = 'user-123';

  beforeEach(() => {
    service = new FitnessService();
    vi.clearAllMocks();
  });

  describe('createWorkoutSession', () => {
    it('should create a session with sets', async () => {
      const session = { id: 'session-1', userId, name: 'Chest Day', sets: [] };
      vi.mocked(db.workoutSession.create).mockResolvedValue(session as any);

      const result = await service.createSession(userId, {
        name: 'Chest Day',
        startedAt: '2024-01-15T09:00:00.000Z',
        endedAt: '2024-01-15T10:00:00.000Z',
      });

      expect(db.workoutSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId, name: 'Chest Day' }),
        })
      );
      expect(result.id).toBe('session-1');
    });
  });

  describe('getSessions', () => {
    it('should return paginated sessions', async () => {
      vi.mocked(db.workoutSession.findMany).mockResolvedValue([{ id: 'session-1' }] as any);
      vi.mocked(db.workoutSession.count).mockResolvedValue(1);

      const result = await service.getSessions(userId, { limit: 20, offset: 0 });
      expect(result.total).toBe(1);
    });
  });

  describe('getSession', () => {
    it('should throw when session not found', async () => {
      vi.mocked(db.workoutSession.findFirst).mockResolvedValue(null);
      await expect(service.getSession(userId, 'bad-id')).rejects.toThrow(AppError);
    });
  });

  describe('getPersonalRecords', () => {
    it('should return all PRs for a user', async () => {
      vi.mocked(db.personalRecord.findMany).mockResolvedValue([{ id: 'pr-1' }] as any);
      const result = await service.getPersonalRecords(userId);
      expect(result).toHaveLength(1);
    });
  });

  describe('getExercises', () => {
    it('should filter by search term', async () => {
      vi.mocked(db.exercise.findMany).mockResolvedValue([{ id: 'ex-1', name: 'Bench Press' }] as any);
      vi.mocked(db.exercise.count).mockResolvedValue(1);

      const result = await service.getExercises({ search: 'bench', limit: 50, offset: 0 });
      expect(db.exercise.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ name: expect.objectContaining({ contains: 'bench' }) }),
        })
      );
    });
  });
});
