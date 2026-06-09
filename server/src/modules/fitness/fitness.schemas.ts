import { z } from 'zod';

export const exerciseSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['strength', 'cardio', 'flexibility', 'sport']),
  muscleGroups: z.array(z.string()).min(1),
  equipment: z.string().max(100).optional(),
  instructions: z.string().max(2000).optional(),
});

export const workoutSetSchema = z.object({
  exerciseId: z.string().cuid(),
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(1).optional(),
  weightKg: z.number().min(0).optional(),
  durationSec: z.number().int().min(1).optional(),
  distanceM: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export const createWorkoutSessionSchema = z.object({
  name: z.string().max(100).optional(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
  sets: z.array(workoutSetSchema).optional(),
});

export const updateWorkoutSessionSchema = createWorkoutSessionSchema.partial();

export const addSetSchema = workoutSetSchema;

export const exerciseQuerySchema = z.object({
  search: z.string().optional(),
  category: z.enum(['strength', 'cardio', 'flexibility', 'sport']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const sessionQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateWorkoutSessionInput = z.infer<typeof createWorkoutSessionSchema>;
export type UpdateWorkoutSessionInput = z.infer<typeof updateWorkoutSessionSchema>;
export type AddSetInput = z.infer<typeof addSetSchema>;
export type ExerciseQueryInput = z.infer<typeof exerciseQuerySchema>;
export type SessionQueryInput = z.infer<typeof sessionQuerySchema>;
export type ExerciseInput = z.infer<typeof exerciseSchema>;
