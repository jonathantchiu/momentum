import { z } from 'zod';

export const createSleepLogSchema = z.object({
  bedtime: z.string().datetime({ message: 'bedtime must be a valid ISO datetime' }),
  wakeTime: z.string().datetime({ message: 'wakeTime must be a valid ISO datetime' }),
  quality: z.number().int().min(1).max(5),
  notes: z.string().max(1000).optional(),
});

export const updateSleepLogSchema = createSleepLogSchema.partial();

export const sleepQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateSleepLogInput = z.infer<typeof createSleepLogSchema>;
export type UpdateSleepLogInput = z.infer<typeof updateSleepLogSchema>;
export type SleepQueryInput = z.infer<typeof sleepQuerySchema>;
