import { describe, it, expect, beforeEach } from 'vitest';
import { MealPlanService } from '../../modules/nutrition/meal-plan.service.js';
import { NutritionService } from '../../modules/nutrition/nutrition.service.js';
import { db } from '../../shared/db.js';

const mealSvc = new MealPlanService();
const nutritionSvc = new NutritionService();
let userId: string;
let recipeId: string;

beforeEach(async () => {
  await db.mealPlanItem.deleteMany();
  await db.mealPlan.deleteMany();
  await db.ingredient.deleteMany();
  await db.recipe.deleteMany();
  await db.refreshToken.deleteMany();
  await db.user.deleteMany();
  const user = await db.user.create({
    data: { email: 'meal@test.com', name: 'Meal', passwordHash: 'h' },
  });
  userId = user.id;
  const recipe = await nutritionSvc.createRecipe(userId, {
    name: 'Test Recipe',
    ingredients: [{ name: 'Item', quantity: 100, unit: 'g', calories: 200, proteinG: 20, carbsG: 30, fatG: 5 }],
  });
  recipeId = recipe.id;
});

describe('MealPlanService.getOrCreatePlan', () => {
  it('creates new plan for a week', async () => {
    const plan = await mealSvc.getOrCreatePlan(userId, '2026-03-23');
    expect(plan.userId).toBe(userId);
    expect(plan.items).toHaveLength(0);
  });

  it('returns existing plan on second call', async () => {
    const p1 = await mealSvc.getOrCreatePlan(userId, '2026-03-23');
    const p2 = await mealSvc.getOrCreatePlan(userId, '2026-03-23');
    expect(p1.id).toBe(p2.id);
  });
});

describe('MealPlanService.addItem', () => {
  it('adds recipe to meal slot', async () => {
    const plan = await mealSvc.getOrCreatePlan(userId, '2026-03-23');
    const item = await mealSvc.addItem(userId, plan.id, {
      recipeId,
      dayOfWeek: 1,
      mealType: 'lunch',
    });
    expect(item.recipeId).toBe(recipeId);
    expect(item.dayOfWeek).toBe(1);
    expect(item.mealType).toBe('lunch');
  });
});

describe('MealPlanService.removeItem', () => {
  it('removes item from plan', async () => {
    const plan = await mealSvc.getOrCreatePlan(userId, '2026-03-23');
    const item = await mealSvc.addItem(userId, plan.id, {
      recipeId,
      dayOfWeek: 0,
      mealType: 'breakfast',
    });
    await mealSvc.removeItem(userId, item.id);
    const updated = await mealSvc.getOrCreatePlan(userId, '2026-03-23');
    expect(updated.items).toHaveLength(0);
  });
});

describe('MealPlanService.moveItem', () => {
  it('moves item to different slot', async () => {
    const plan = await mealSvc.getOrCreatePlan(userId, '2026-03-23');
    const item = await mealSvc.addItem(userId, plan.id, {
      recipeId,
      dayOfWeek: 0,
      mealType: 'breakfast',
    });
    const moved = await mealSvc.moveItem(userId, item.id, {
      dayOfWeek: 3,
      mealType: 'dinner',
    });
    expect(moved.dayOfWeek).toBe(3);
    expect(moved.mealType).toBe('dinner');
  });
});
