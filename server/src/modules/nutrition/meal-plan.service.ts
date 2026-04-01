import { db } from '../../shared/db.js';
import { AppError } from '../../shared/middleware/error.middleware.js';
import type { MealPlanItemInput, MoveMealPlanItemInput } from './nutrition.schema.js';

export class MealPlanService {
  async getOrCreatePlan(userId: string, weekStart: string) {
    const date = new Date(weekStart);
    const existing = await db.mealPlan.findUnique({
      where: { userId_weekStart: { userId, weekStart: date } },
      include: { items: { include: { recipe: true } } },
    });
    if (existing) return existing;

    return db.mealPlan.create({
      data: { userId, weekStart: date },
      include: { items: { include: { recipe: true } } },
    });
  }

  async addItem(userId: string, planId: string, input: MealPlanItemInput) {
    const plan = await db.mealPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.userId !== userId) {
      throw new AppError(404, 'Meal plan not found');
    }

    return db.mealPlanItem.create({
      data: {
        planId,
        recipeId: input.recipeId,
        dayOfWeek: input.dayOfWeek,
        mealType: input.mealType,
      },
      include: { recipe: true },
    });
  }

  async removeItem(userId: string, itemId: string) {
    const item = await db.mealPlanItem.findUnique({
      where: { id: itemId },
      include: { plan: true },
    });
    if (!item || item.plan.userId !== userId) {
      throw new AppError(404, 'Meal plan item not found');
    }
    await db.mealPlanItem.delete({ where: { id: itemId } });
  }

  async moveItem(userId: string, itemId: string, input: MoveMealPlanItemInput) {
    const item = await db.mealPlanItem.findUnique({
      where: { id: itemId },
      include: { plan: true },
    });
    if (!item || item.plan.userId !== userId) {
      throw new AppError(404, 'Meal plan item not found');
    }

    return db.mealPlanItem.update({
      where: { id: itemId },
      data: { dayOfWeek: input.dayOfWeek, mealType: input.mealType },
      include: { recipe: true },
    });
  }

  async getWeekMacros(userId: string, weekStart: string) {
    const plan = await this.getOrCreatePlan(userId, weekStart);
    const recipeIds = [...new Set(plan.items.map((i) => i.recipeId))];
    const ingredients = await db.ingredient.findMany({
      where: { recipeId: { in: recipeIds } },
    });

    const macrosByRecipe = new Map<string, { calories: number; proteinG: number; carbsG: number; fatG: number }>();
    for (const ing of ingredients) {
      const prev = macrosByRecipe.get(ing.recipeId) ?? { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };
      macrosByRecipe.set(ing.recipeId, {
        calories: prev.calories + (ing.calories ?? 0),
        proteinG: prev.proteinG + (ing.proteinG ?? 0),
        carbsG: prev.carbsG + (ing.carbsG ?? 0),
        fatG: prev.fatG + (ing.fatG ?? 0),
      });
    }

    const daily: Record<number, { calories: number; proteinG: number; carbsG: number; fatG: number }> = {};
    for (let d = 0; d < 7; d++) {
      daily[d] = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };
    }
    for (const item of plan.items) {
      const m = macrosByRecipe.get(item.recipeId);
      if (m) {
        daily[item.dayOfWeek].calories += m.calories;
        daily[item.dayOfWeek].proteinG += m.proteinG;
        daily[item.dayOfWeek].carbsG += m.carbsG;
        daily[item.dayOfWeek].fatG += m.fatG;
      }
    }
    return daily;
  }
}
