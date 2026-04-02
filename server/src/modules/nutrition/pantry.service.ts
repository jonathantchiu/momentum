import { db } from '../../shared/db.js';
import { AppError } from '../../shared/middleware/error.middleware.js';
import type { CreatePantryItemInput, UpdatePantryItemInput } from './nutrition.schema.js';

export class PantryService {
  async addItem(userId: string, input: CreatePantryItemInput) {
    return db.pantryItem.create({
      data: {
        userId,
        name: input.name,
        quantity: input.quantity,
        unit: input.unit,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
        usdaFoodId: input.usdaFoodId ?? null,
      },
    });
  }

  async getItems(userId: string) {
    return db.pantryItem.findMany({
      where: { userId },
      orderBy: [{ expiryDate: 'asc' }, { name: 'asc' }],
    });
  }

  async updateItem(userId: string, itemId: string, input: UpdatePantryItemInput) {
    const existing = await db.pantryItem.findUnique({ where: { id: itemId } });
    if (!existing || existing.userId !== userId) {
      throw new AppError(404, 'Pantry item not found');
    }
    return db.pantryItem.update({
      where: { id: itemId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.quantity !== undefined && { quantity: input.quantity }),
        ...(input.unit !== undefined && { unit: input.unit }),
        ...(input.expiryDate !== undefined && { expiryDate: input.expiryDate ? new Date(input.expiryDate) : null }),
        ...(input.usdaFoodId !== undefined && { usdaFoodId: input.usdaFoodId }),
      },
    });
  }

  async deleteItem(userId: string, itemId: string) {
    const existing = await db.pantryItem.findUnique({ where: { id: itemId } });
    if (!existing || existing.userId !== userId) {
      throw new AppError(404, 'Pantry item not found');
    }
    await db.pantryItem.delete({ where: { id: itemId } });
  }

  async getExpiringItems(userId: string, withinDays: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    return db.pantryItem.findMany({
      where: {
        userId,
        expiryDate: { not: null, lte: cutoff },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  async deductFromPantry(userId: string, ingredients: { name: string; quantity: number; unit: string }[]) {
    for (const ing of ingredients) {
      const pantryItem = await db.pantryItem.findFirst({
        where: { userId, name: { equals: ing.name, mode: 'insensitive' }, unit: ing.unit },
      });
      if (pantryItem) {
        const newQty = Math.max(0, pantryItem.quantity - ing.quantity);
        if (newQty === 0) {
          await db.pantryItem.delete({ where: { id: pantryItem.id } });
        } else {
          await db.pantryItem.update({ where: { id: pantryItem.id }, data: { quantity: newQty } });
        }
      }
    }
  }
}
