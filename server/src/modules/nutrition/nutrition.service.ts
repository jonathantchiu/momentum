import { db } from '../../shared/db.js';
import { AppError } from '../../shared/middleware/error.middleware.js';
import type { CreateRecipeInput, UpdateRecipeInput } from './nutrition.schema.js';

export class NutritionService {
  async createRecipe(userId: string, input: CreateRecipeInput) {
    return db.recipe.create({
      data: {
        userId,
        name: input.name,
        servings: input.servings ?? 1,
        instructions: input.instructions ?? '',
        sourceUrl: input.sourceUrl || null,
        imageUrl: input.imageUrl || null,
        prepTimeMin: input.prepTimeMin ?? null,
        cookTimeMin: input.cookTimeMin ?? null,
        ingredients: {
          create: input.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            calories: ing.calories ?? null,
            proteinG: ing.proteinG ?? null,
            carbsG: ing.carbsG ?? null,
            fatG: ing.fatG ?? null,
            fiberG: ing.fiberG ?? null,
            usdaFoodId: ing.usdaFoodId ?? null,
          })),
        },
      },
      include: { ingredients: true },
    });
  }

  async getRecipes(userId: string, search?: string) {
    return db.recipe.findMany({
      where: {
        userId,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      include: { _count: { select: { ingredients: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getRecipe(userId: string, recipeId: string) {
    const recipe = await db.recipe.findUnique({
      where: { id: recipeId },
      include: { ingredients: true },
    });
    if (!recipe || recipe.userId !== userId) return null;
    return recipe;
  }

  async updateRecipe(userId: string, recipeId: string, input: UpdateRecipeInput) {
    const existing = await db.recipe.findUnique({ where: { id: recipeId } });
    if (!existing || existing.userId !== userId) {
      throw new AppError(404, 'Recipe not found');
    }

    if (input.ingredients) {
      await db.ingredient.deleteMany({ where: { recipeId } });
    }

    return db.recipe.update({
      where: { id: recipeId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.servings !== undefined && { servings: input.servings }),
        ...(input.instructions !== undefined && { instructions: input.instructions }),
        ...(input.sourceUrl !== undefined && { sourceUrl: input.sourceUrl || null }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl || null }),
        ...(input.prepTimeMin !== undefined && { prepTimeMin: input.prepTimeMin }),
        ...(input.cookTimeMin !== undefined && { cookTimeMin: input.cookTimeMin }),
        ...(input.ingredients && {
          ingredients: {
            create: input.ingredients.map((ing) => ({
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              calories: ing.calories ?? null,
              proteinG: ing.proteinG ?? null,
              carbsG: ing.carbsG ?? null,
              fatG: ing.fatG ?? null,
              fiberG: ing.fiberG ?? null,
              usdaFoodId: ing.usdaFoodId ?? null,
            })),
          },
        }),
      },
      include: { ingredients: true },
    });
  }

  async deleteRecipe(userId: string, recipeId: string) {
    const existing = await db.recipe.findUnique({ where: { id: recipeId } });
    if (!existing || existing.userId !== userId) {
      throw new AppError(404, 'Recipe not found');
    }
    await db.recipe.delete({ where: { id: recipeId } });
  }

  async getRecipeMacros(recipeId: string) {
    const ingredients = await db.ingredient.findMany({ where: { recipeId } });
    return ingredients.reduce(
      (acc, ing) => ({
        calories: acc.calories + (ing.calories ?? 0),
        proteinG: acc.proteinG + (ing.proteinG ?? 0),
        carbsG: acc.carbsG + (ing.carbsG ?? 0),
        fatG: acc.fatG + (ing.fatG ?? 0),
        fiberG: acc.fiberG + (ing.fiberG ?? 0),
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 }
    );
  }
}
