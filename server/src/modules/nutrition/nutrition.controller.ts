import type { Request, Response, NextFunction } from 'express';
import { NutritionService } from './nutrition.service.js';
import { MealPlanService } from './meal-plan.service.js';
import { PantryService } from './pantry.service.js';
import { ShoppingListService } from './shopping-list.service.js';
import { UsdaService } from './usda.service.js';
import {
  createRecipeSchema,
  updateRecipeSchema,
  mealPlanItemSchema,
  moveMealPlanItemSchema,
  createPantryItemSchema,
  updatePantryItemSchema,
  updateTargetsSchema,
} from './nutrition.schema.js';
import { AppError } from '../../shared/middleware/error.middleware.js';
import { ok } from '../../shared/lib/response.js';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import { db } from '../../shared/db.js';

const nutritionSvc = new NutritionService();
const mealPlanSvc = new MealPlanService();
const pantrySvc = new PantryService();
const shoppingSvc = new ShoppingListService();
const usdaSvc = new UsdaService();

function uid(req: Request) {
  return (req as AuthRequest).userId;
}

export async function createRecipe(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createRecipeSchema.safeParse(req.body);
    if (!input.success) throw new AppError(400, input.error.issues[0].message);
    const recipe = await nutritionSvc.createRecipe(uid(req), input.data);
    res.status(201).json(ok(recipe));
  } catch (e) { next(e); }
}

export async function getRecipes(req: Request, res: Response, next: NextFunction) {
  try {
    const search = req.query.search as string | undefined;
    const recipes = await nutritionSvc.getRecipes(uid(req), search);
    res.json(ok(recipes));
  } catch (e) { next(e); }
}

export async function getRecipe(req: Request, res: Response, next: NextFunction) {
  try {
    const recipe = await nutritionSvc.getRecipe(uid(req), req.params.id);
    if (!recipe) throw new AppError(404, 'Recipe not found');
    res.json(ok(recipe));
  } catch (e) { next(e); }
}

export async function updateRecipe(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateRecipeSchema.safeParse(req.body);
    if (!input.success) throw new AppError(400, input.error.issues[0].message);
    const recipe = await nutritionSvc.updateRecipe(uid(req), req.params.id, input.data);
    res.json(ok(recipe));
  } catch (e) { next(e); }
}

export async function deleteRecipe(req: Request, res: Response, next: NextFunction) {
  try {
    await nutritionSvc.deleteRecipe(uid(req), req.params.id);
    res.json(ok(null));
  } catch (e) { next(e); }
}

export async function getCurrentWeekPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const weekStart = (req.query.weekStart as string) || getMonday(new Date());
    const plan = await mealPlanSvc.getOrCreatePlan(uid(req), weekStart);
    res.json(ok(plan));
  } catch (e) { next(e); }
}

export async function addMealPlanItem(req: Request, res: Response, next: NextFunction) {
  try {
    const input = mealPlanItemSchema.safeParse(req.body);
    if (!input.success) throw new AppError(400, input.error.issues[0].message);
    const weekStart = (req.query.weekStart as string) || getMonday(new Date());
    const plan = await mealPlanSvc.getOrCreatePlan(uid(req), weekStart);
    const item = await mealPlanSvc.addItem(uid(req), plan.id, input.data);
    res.status(201).json(ok(item));
  } catch (e) { next(e); }
}

export async function removeMealPlanItem(req: Request, res: Response, next: NextFunction) {
  try {
    await mealPlanSvc.removeItem(uid(req), req.params.id);
    res.json(ok(null));
  } catch (e) { next(e); }
}

export async function moveMealPlanItem(req: Request, res: Response, next: NextFunction) {
  try {
    const input = moveMealPlanItemSchema.safeParse(req.body);
    if (!input.success) throw new AppError(400, input.error.issues[0].message);
    const item = await mealPlanSvc.moveItem(uid(req), req.params.id, input.data);
    res.json(ok(item));
  } catch (e) { next(e); }
}

export async function getPantryItems(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await pantrySvc.getItems(uid(req));
    res.json(ok(items));
  } catch (e) { next(e); }
}

export async function addPantryItem(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createPantryItemSchema.safeParse(req.body);
    if (!input.success) throw new AppError(400, input.error.issues[0].message);
    const item = await pantrySvc.addItem(uid(req), input.data);
    res.status(201).json(ok(item));
  } catch (e) { next(e); }
}

export async function updatePantryItem(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updatePantryItemSchema.safeParse(req.body);
    if (!input.success) throw new AppError(400, input.error.issues[0].message);
    const item = await pantrySvc.updateItem(uid(req), req.params.id, input.data);
    res.json(ok(item));
  } catch (e) { next(e); }
}

export async function deletePantryItem(req: Request, res: Response, next: NextFunction) {
  try {
    await pantrySvc.deleteItem(uid(req), req.params.id);
    res.json(ok(null));
  } catch (e) { next(e); }
}

export async function generateShoppingList(req: Request, res: Response, next: NextFunction) {
  try {
    const weekStart = (req.query.weekStart as string) || getMonday(new Date());
    const list = await shoppingSvc.generateFromMealPlan(uid(req), weekStart);
    res.json(ok(list));
  } catch (e) { next(e); }
}

export async function getNutritionTargets(req: Request, res: Response, next: NextFunction) {
  try {
    let target = await db.dailyNutritionTarget.findUnique({ where: { userId: uid(req) } });
    if (!target) {
      target = await db.dailyNutritionTarget.create({ data: { userId: uid(req) } });
    }
    res.json(ok(target));
  } catch (e) { next(e); }
}

export async function updateNutritionTargets(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateTargetsSchema.safeParse(req.body);
    if (!input.success) throw new AppError(400, input.error.issues[0].message);
    const target = await db.dailyNutritionTarget.upsert({
      where: { userId: uid(req) },
      update: input.data,
      create: { userId: uid(req), ...input.data },
    });
    res.json(ok(target));
  } catch (e) { next(e); }
}

export async function searchUSDA(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query.q as string;
    if (!q) throw new AppError(400, 'Query parameter q is required');
    const results = await usdaSvc.searchFoods(q);
    res.json(ok(results));
  } catch (e) { next(e); }
}

export async function getUSDANutrients(req: Request, res: Response, next: NextFunction) {
  try {
    const nutrients = await usdaSvc.getNutrients(req.params.fdcId);
    if (!nutrients) throw new AppError(404, 'Food not found');
    res.json(ok(nutrients));
  } catch (e) { next(e); }
}

function getMonday(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}
