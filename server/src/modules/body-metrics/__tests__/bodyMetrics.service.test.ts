import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BodyMetricsService } from '../bodyMetrics.service';
import { db } from '../../../lib/db';
import { AppError } from '../../../lib/errors';

vi.mock('../../../lib/db', () => ({
  db: {
    bodyMetric: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('BodyMetricsService', () => {
  let service: BodyMetricsService;
  const userId = 'user-123';

  beforeEach(() => {
    service = new BodyMetricsService();
    vi.clearAllMocks();
  });

  describe('createMetric', () => {
    it('should create a body metric entry', async () => {
      const input = { recordedAt: '2024-01-15T08:00:00.000Z', weightKg: 75.5, bodyFatPct: 18 };
      const expected = { id: 'metric-1', userId, ...input, recordedAt: new Date(input.recordedAt) };
      vi.mocked(db.bodyMetric.create).mockResolvedValue(expected as any);

      const result = await service.createMetric(userId, input);
      expect(result.id).toBe('metric-1');
      expect(db.bodyMetric.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId, weightKg: 75.5 }) })
      );
    });
  });

  describe('getMetric', () => {
    it('should throw when metric not found', async () => {
      vi.mocked(db.bodyMetric.findFirst).mockResolvedValue(null);
      await expect(service.getMetric(userId, 'bad-id')).rejects.toThrow(AppError);
    });
  });

  describe('getProgress', () => {
    it('should compute weight progress between first and last entry', async () => {
      const metrics = [
        { recordedAt: new Date('2024-01-01'), weightKg: 80, bodyFatPct: 22 },
        { recordedAt: new Date('2024-01-15'), weightKg: 78.5, bodyFatPct: 21 },
        { recordedAt: new Date('2024-01-30'), weightKg: 77.2, bodyFatPct: 20 },
      ];
      vi.mocked(db.bodyMetric.findMany).mockResolvedValue(metrics as any);

      const result = await service.getProgress(userId, 30);
      expect(result.weightChangKg).toBeCloseTo(-2.8, 1);
      expect(result.totalReadings).toBe(3);
    });
  });
});
