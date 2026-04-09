import { describe, it, expect, beforeEach } from 'vitest';
import { ShoppingListService } from '../../modules/nutrition/shopping-list.service.js';
import { NutritionService } from '../../modules/nutrition/nutrition.service.js';
import { MealPlanService } from '../../modules/nutrition/meal-plan.service.js';
import { PantryService } from '../../modules/nutrition/pantry.service.js';
import { db } from '../../shared/db.js';

const shopSvc = new ShoppingListService();
const nutritionSvc = new NutritionService();
const mealSvc = new MealPlanService();
const pantrySvc = new PantryService();
let userId: string;

beforeEach(async () => {
  await db.pantryItem.deleteMany();
  await db.mealPlanItem.deleteMany();
  await db.mealPlan.deleteMany();
  await db.ingredient.deleteMany();
  await db.recipe.deleteMany();
  await db.refreshToken.deleteMany();
  await db.user.deleteMany();
  const user = await db.user.create({
    data: { email: 'shop@test.com', name: 'Shop', passwordHash: 'h' },
  });
  userId = user.id;
});

describe('ShoppingListService.generateFromMealPlan', () => {
  it('aggregates ingredients from meal plan', async () => {
    const recipe = await nutritionSvc.createRecipe(userId, {
      name: 'Pasta',
      ingredients: [
        { name: 'Spaghetti', quantity: 200, unit: 'g' },
        { name: 'Tomato Sauce', quantity: 100, unit: 'ml' },
      ],
    });
    const plan = await mealSvc.getOrCreatePlan(userId, '2026-04-06');
    await mealSvc.addItem(userId, plan.id, { recipeId: recipe.id, dayOfWeek: 0, mealType: 'dinner' });
    await mealSvc.addItem(userId, plan.id, { recipeId: recipe.id, dayOfWeek: 2, mealType: 'dinner' });

    const list = await shopSvc.generateFromMealPlan(userId, '2026-04-06');
    const spaghetti = list.find((i) => i.name === 'Spaghetti');
    expect(spaghetti).toBeDefined();
    expect(spaghetti!.need).toBe(400);
  });

  it('deducts pantry stock', async () => {
    const recipe = await nutritionSvc.createRecipe(userId, {
      name: 'Rice Bowl',
      ingredients: [{ name: 'Rice', quantity: 300, unit: 'g' }],
    });
    await pantrySvc.addItem(userId, { name: 'Rice', quantity: 200, unit: 'g' });
    const plan = await mealSvc.getOrCreatePlan(userId, '2026-04-06');
    await mealSvc.addItem(userId, plan.id, { recipeId: recipe.id, dayOfWeek: 1, mealType: 'lunch' });

    const list = await shopSvc.generateFromMealPlan(userId, '2026-04-06');
    const rice = list.find((i) => i.name === 'Rice');
    expect(rice).toBeDefined();
    expect(rice!.have).toBe(200);
    expect(rice!.need).toBe(100);
  });

  it('returns empty list for empty meal plan', async () => {
    await mealSvc.getOrCreatePlan(userId, '2026-04-06');
    const list = await shopSvc.generateFromMealPlan(userId, '2026-04-06');
    expect(list).toHaveLength(0);
  });
});
