import { z } from 'zod';

const ingredientInput = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  usdaFoodId: z.string().optional(),
  calories: z.number().optional(),
  proteinG: z.number().optional(),
  carbsG: z.number().optional(),
  fatG: z.number().optional(),
  fiberG: z.number().optional(),
});

export const createRecipeSchema = z.object({
  name: z.string().min(1).max(200),
  servings: z.number().int().min(1).default(1),
  instructions: z.string().default(''),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  prepTimeMin: z.number().int().min(0).optional(),
  cookTimeMin: z.number().int().min(0).optional(),
  ingredients: z.array(ingredientInput).min(1),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export const mealPlanItemSchema = z.object({
  recipeId: z.string().min(1),
  dayOfWeek: z.number().int().min(0).max(6),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
});

export const moveMealPlanItemSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
});

export const createPantryItemSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  expiryDate: z.string().optional(),
  usdaFoodId: z.string().optional(),
});

export const updatePantryItemSchema = createPantryItemSchema.partial();

export const updateTargetsSchema = z.object({
  calories: z.number().int().min(0).optional(),
  proteinG: z.number().int().min(0).optional(),
  carbsG: z.number().int().min(0).optional(),
  fatG: z.number().int().min(0).optional(),
  fiberG: z.number().int().min(0).optional(),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type MealPlanItemInput = z.infer<typeof mealPlanItemSchema>;
export type MoveMealPlanItemInput = z.infer<typeof moveMealPlanItemSchema>;
export type CreatePantryItemInput = z.infer<typeof createPantryItemSchema>;
export type UpdatePantryItemInput = z.infer<typeof updatePantryItemSchema>;
export type UpdateTargetsInput = z.infer<typeof updateTargetsSchema>;
