import { describe, it, expect, beforeEach } from 'vitest';
import { NutritionService } from '../../modules/nutrition/nutrition.service.js';
import { db } from '../../shared/db.js';

const svc = new NutritionService();
let userId: string;

beforeEach(async () => {
  await db.mealPlanItem.deleteMany();
  await db.mealPlan.deleteMany();
  await db.ingredient.deleteMany();
  await db.recipe.deleteMany();
  await db.refreshToken.deleteMany();
  await db.user.deleteMany();
  const user = await db.user.create({
    data: { email: 'chef@test.com', name: 'Chef', passwordHash: 'hashed' },
  });
  userId = user.id;
});

describe('NutritionService.createRecipe', () => {
  it('creates recipe with ingredients', async () => {
    const recipe = await svc.createRecipe(userId, {
      name: 'Pasta',
      servings: 2,
      instructions: 'Boil and serve',
      ingredients: [
        { name: 'Spaghetti', quantity: 200, unit: 'g' },
        { name: 'Tomato Sauce', quantity: 150, unit: 'ml' },
      ],
    });
    expect(recipe.name).toBe('Pasta');
    expect(recipe.ingredients).toHaveLength(2);
    expect(recipe.userId).toBe(userId);
  });
});

describe('NutritionService.getRecipes', () => {
  it('returns all recipes for user', async () => {
    await svc.createRecipe(userId, {
      name: 'Recipe A',
      ingredients: [{ name: 'Flour', quantity: 100, unit: 'g' }],
    });
    await svc.createRecipe(userId, {
      name: 'Recipe B',
      ingredients: [{ name: 'Sugar', quantity: 50, unit: 'g' }],
    });
    const recipes = await svc.getRecipes(userId);
    expect(recipes).toHaveLength(2);
  });

  it('filters by search query', async () => {
    await svc.createRecipe(userId, {
      name: 'Chicken Salad',
      ingredients: [{ name: 'Chicken', quantity: 200, unit: 'g' }],
    });
    await svc.createRecipe(userId, {
      name: 'Beef Stew',
      ingredients: [{ name: 'Beef', quantity: 300, unit: 'g' }],
    });
    const results = await svc.getRecipes(userId, 'chicken');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Chicken Salad');
  });
});

describe('NutritionService.getRecipe', () => {
  it('returns recipe with full ingredients', async () => {
    const created = await svc.createRecipe(userId, {
      name: 'Salad',
      ingredients: [{ name: 'Lettuce', quantity: 100, unit: 'g' }],
    });
    const recipe = await svc.getRecipe(userId, created.id);
    expect(recipe).not.toBeNull();
    expect(recipe!.ingredients).toHaveLength(1);
  });

  it('returns null for other user recipe', async () => {
    const other = await db.user.create({
      data: { email: 'other@test.com', name: 'Other', passwordHash: 'h' },
    });
    const created = await svc.createRecipe(other.id, {
      name: 'Secret',
      ingredients: [{ name: 'X', quantity: 1, unit: 'g' }],
    });
    const recipe = await svc.getRecipe(userId, created.id);
    expect(recipe).toBeNull();
  });
});

describe('NutritionService.updateRecipe', () => {
  it('updates recipe name and ingredients', async () => {
    const created = await svc.createRecipe(userId, {
      name: 'Old Name',
      ingredients: [{ name: 'A', quantity: 1, unit: 'g' }],
    });
    const updated = await svc.updateRecipe(userId, created.id, {
      name: 'New Name',
      ingredients: [
        { name: 'B', quantity: 2, unit: 'ml' },
        { name: 'C', quantity: 3, unit: 'kg' },
      ],
    });
    expect(updated.name).toBe('New Name');
    expect(updated.ingredients).toHaveLength(2);
  });
});

describe('NutritionService.deleteRecipe', () => {
  it('deletes recipe and its ingredients', async () => {
    const created = await svc.createRecipe(userId, {
      name: 'Delete Me',
      ingredients: [{ name: 'X', quantity: 1, unit: 'g' }],
    });
    await svc.deleteRecipe(userId, created.id);
    const found = await db.recipe.findUnique({ where: { id: created.id } });
    expect(found).toBeNull();
  });
});
