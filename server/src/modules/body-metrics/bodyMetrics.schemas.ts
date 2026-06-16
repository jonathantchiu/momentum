import { z } from 'zod';

export const createBodyMetricSchema = z.object({
  recordedAt: z.string().datetime(),
  weightKg: z.number().positive().optional(),
  bodyFatPct: z.number().min(1).max(60).optional(),
  muscleMassKg: z.number().positive().optional(),
  waterPct: z.number().min(1).max(90).optional(),
  bmi: z.number().positive().optional(),
  waistCm: z.number().positive().optional(),
  hipCm: z.number().positive().optional(),
  chestCm: z.number().positive().optional(),
  armCm: z.number().positive().optional(),
  thighCm: z.number().positive().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateBodyMetricSchema = createBodyMetricSchema.partial();

export const bodyMetricQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateBodyMetricInput = z.infer<typeof createBodyMetricSchema>;
export type UpdateBodyMetricInput = z.infer<typeof updateBodyMetricSchema>;
export type BodyMetricQueryInput = z.infer<typeof bodyMetricQuerySchema>;
