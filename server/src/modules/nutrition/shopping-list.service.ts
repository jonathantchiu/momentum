import { db } from '../../shared/db.js';

interface ShoppingListItem {
  name: string;
  quantity: number;
  unit: string;
  have: number;
  need: number;
}

export class ShoppingListService {
  async generateFromMealPlan(userId: string, weekStart: string): Promise<ShoppingListItem[]> {
    const date = new Date(weekStart);
    const plan = await db.mealPlan.findUnique({
      where: { userId_weekStart: { userId, weekStart: date } },
      include: {
        items: {
          include: {
            recipe: {
              include: { ingredients: true },
            },
          },
        },
      },
    });

    if (!plan || plan.items.length === 0) return [];

    const aggregated = new Map<string, { quantity: number; unit: string }>();

    for (const item of plan.items) {
      for (const ing of item.recipe.ingredients) {
        const key = `${ing.name.toLowerCase()}|${ing.unit}`;
        const prev = aggregated.get(key);
        if (prev) {
          prev.quantity += ing.quantity;
        } else {
          aggregated.set(key, { quantity: ing.quantity, unit: ing.unit });
        }
      }
    }

    const pantryItems = await db.pantryItem.findMany({ where: { userId } });
    const pantryMap = new Map<string, number>();
    for (const p of pantryItems) {
      const key = `${p.name.toLowerCase()}|${p.unit}`;
      pantryMap.set(key, (pantryMap.get(key) ?? 0) + p.quantity);
    }

    const result: ShoppingListItem[] = [];
    for (const [key, agg] of aggregated) {
      const name = key.split('|')[0];
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      const have = pantryMap.get(key) ?? 0;
      const need = Math.max(0, agg.quantity - have);
      result.push({
        name: displayName,
        quantity: agg.quantity,
        unit: agg.unit,
        have,
        need,
      });
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }
}
