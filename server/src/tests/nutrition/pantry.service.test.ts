import { describe, it, expect, beforeEach } from 'vitest';
import { PantryService } from '../../modules/nutrition/pantry.service.js';
import { db } from '../../shared/db.js';

const svc = new PantryService();
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
    data: { email: 'pantry@test.com', name: 'Pantry', passwordHash: 'h' },
  });
  userId = user.id;
});

describe('PantryService.addItem', () => {
  it('adds item to pantry', async () => {
    const item = await svc.addItem(userId, {
      name: 'Rice',
      quantity: 2,
      unit: 'kg',
    });
    expect(item.name).toBe('Rice');
    expect(item.quantity).toBe(2);
  });
});

describe('PantryService.getItems', () => {
  it('returns all pantry items', async () => {
    await svc.addItem(userId, { name: 'Rice', quantity: 2, unit: 'kg' });
    await svc.addItem(userId, { name: 'Beans', quantity: 500, unit: 'g' });
    const items = await svc.getItems(userId);
    expect(items).toHaveLength(2);
  });
});

describe('PantryService.updateItem', () => {
  it('updates item quantity', async () => {
    const item = await svc.addItem(userId, { name: 'Rice', quantity: 2, unit: 'kg' });
    const updated = await svc.updateItem(userId, item.id, { quantity: 1.5 });
    expect(updated.quantity).toBe(1.5);
  });
});

describe('PantryService.deleteItem', () => {
  it('removes item from pantry', async () => {
    const item = await svc.addItem(userId, { name: 'Rice', quantity: 2, unit: 'kg' });
    await svc.deleteItem(userId, item.id);
    const items = await svc.getItems(userId);
    expect(items).toHaveLength(0);
  });
});

describe('PantryService.getExpiringItems', () => {
  it('returns items expiring within N days', async () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 2);
    const later = new Date();
    later.setDate(later.getDate() + 30);

    await svc.addItem(userId, { name: 'Milk', quantity: 1, unit: 'L', expiryDate: soon.toISOString() });
    await svc.addItem(userId, { name: 'Canned Beans', quantity: 3, unit: 'cans', expiryDate: later.toISOString() });

    const expiring = await svc.getExpiringItems(userId, 7);
    expect(expiring).toHaveLength(1);
    expect(expiring[0].name).toBe('Milk');
  });
});
