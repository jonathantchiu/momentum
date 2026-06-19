import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SleepService } from '../sleep.service';
import { db } from '../../../lib/db';
import { AppError } from '../../../lib/errors';

vi.mock('../../../lib/db', () => ({
  db: {
    sleepLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('SleepService', () => {
  let service: SleepService;
  const userId = 'user-123';

  beforeEach(() => {
    service = new SleepService();
    vi.clearAllMocks();
  });

  describe('createLog', () => {
    it('should create a sleep log and compute duration', async () => {
      const input = {
        bedtime: '2024-01-15T22:00:00.000Z',
        wakeTime: '2024-01-16T06:30:00.000Z',
        quality: 4,
      };
      const expected = {
        id: 'log-1',
        userId,
        bedtime: new Date(input.bedtime),
        wakeTime: new Date(input.wakeTime),
        durationMin: 510,
        quality: 4,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(db.sleepLog.create).mockResolvedValue(expected);

      const result = await service.createLog(userId, input);

      expect(db.sleepLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          durationMin: 510,
          quality: 4,
        }),
      });
      expect(result.durationMin).toBe(510);
    });

    it('should throw AppError when wakeTime is before bedtime', async () => {
      const input = {
        bedtime: '2024-01-16T06:00:00.000Z',
        wakeTime: '2024-01-15T22:00:00.000Z',
        quality: 3,
      };

      await expect(service.createLog(userId, input)).rejects.toThrow(AppError);
    });
  });

  describe('getLogs', () => {
    it('should return paginated sleep logs', async () => {
      const logs = [{ id: 'log-1', userId, durationMin: 480, quality: 4 }];
      vi.mocked(db.sleepLog.findMany).mockResolvedValue(logs as any);
      vi.mocked(db.sleepLog.count).mockResolvedValue(1);

      const result = await service.getLogs(userId, { limit: 30, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('getLog', () => {
    it('should return a single sleep log', async () => {
      const log = { id: 'log-1', userId, durationMin: 480, quality: 4 };
      vi.mocked(db.sleepLog.findFirst).mockResolvedValue(log as any);

      const result = await service.getLog(userId, 'log-1');
      expect(result.id).toBe('log-1');
    });

    it('should throw AppError when log not found', async () => {
      vi.mocked(db.sleepLog.findFirst).mockResolvedValue(null);
      await expect(service.getLog(userId, 'nonexistent')).rejects.toThrow(AppError);
    });
  });

  describe('updateLog', () => {
    it('should update a sleep log', async () => {
      const existing = { id: 'log-1', userId, bedtime: new Date('2024-01-15T22:00:00Z'), wakeTime: new Date('2024-01-16T06:00:00Z'), durationMin: 480, quality: 3 };
      const updated = { ...existing, quality: 5 };
      vi.mocked(db.sleepLog.findFirst).mockResolvedValue(existing as any);
      vi.mocked(db.sleepLog.update).mockResolvedValue(updated as any);

      const result = await service.updateLog(userId, 'log-1', { quality: 5 });
      expect(result.quality).toBe(5);
    });
  });

  describe('deleteLog', () => {
    it('should delete a sleep log', async () => {
      const log = { id: 'log-1', userId };
      vi.mocked(db.sleepLog.findFirst).mockResolvedValue(log as any);
      vi.mocked(db.sleepLog.delete).mockResolvedValue(log as any);

      await expect(service.deleteLog(userId, 'log-1')).resolves.toBeUndefined();
    });
  });

  describe('getTrends', () => {
    it('should compute weekly sleep trends', async () => {
      const logs = [
        { durationMin: 480, quality: 4, bedtime: new Date('2024-01-15T22:00:00Z') },
        { durationMin: 420, quality: 3, bedtime: new Date('2024-01-16T23:00:00Z') },
        { durationMin: 510, quality: 5, bedtime: new Date('2024-01-17T21:30:00Z') },
      ];
      vi.mocked(db.sleepLog.findMany).mockResolvedValue(logs as any);

      const result = await service.getTrends(userId, 7);
      expect(result.avgDurationMin).toBeCloseTo(470, 0);
      expect(result.avgQuality).toBeCloseTo(4, 0);
      expect(result.totalNights).toBe(3);
    });
  });
});
