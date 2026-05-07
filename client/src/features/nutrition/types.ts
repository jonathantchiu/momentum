export interface Recipe {
  id: string;
  userId: string;
  name: string;
  servings: number;
  instructions: string;
  sourceUrl: string | null;
  imageUrl: string | null;
  prepTimeMin: number | null;
  cookTimeMin: number | null;
  ingredients: Ingredient[];
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  recipeId: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  usdaFoodId: string | null;
}

export interface MealPlanItem {
  id: string;
  planId: string;
  recipeId: string;
  recipe: Recipe;
  dayOfWeek: number;
  mealType: string;
}

export interface MealPlan {
  id: string;
  userId: string;
  weekStart: string;
  items: MealPlanItem[];
}

export interface PantryItem {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
}

export interface ShoppingListItem {
  name: string;
  quantity: number;
  unit: string;
  have: number;
  need: number;
}

export interface NutritionTargets {
  id: string;
  userId: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}
