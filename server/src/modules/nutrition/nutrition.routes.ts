import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import {
  createRecipe, getRecipes, getRecipe, updateRecipe, deleteRecipe,
  getCurrentWeekPlan, addMealPlanItem, removeMealPlanItem, moveMealPlanItem,
  getPantryItems, addPantryItem, updatePantryItem, deletePantryItem,
  generateShoppingList,
  getNutritionTargets, updateNutritionTargets,
  searchUSDA, getUSDANutrients,
} from './nutrition.controller.js';

const router = Router();
router.use(requireAuth);

router.post('/recipes', createRecipe);
router.get('/recipes', getRecipes);
router.get('/recipes/:id', getRecipe);
router.put('/recipes/:id', updateRecipe);
router.delete('/recipes/:id', deleteRecipe);

router.get('/meal-plans', getCurrentWeekPlan);
router.post('/meal-plans/items', addMealPlanItem);
router.delete('/meal-plans/items/:id', removeMealPlanItem);
router.put('/meal-plans/items/:id', moveMealPlanItem);

router.get('/pantry', getPantryItems);
router.post('/pantry', addPantryItem);
router.put('/pantry/:id', updatePantryItem);
router.delete('/pantry/:id', deletePantryItem);

router.get('/shopping-list', generateShoppingList);

router.get('/targets', getNutritionTargets);
router.put('/targets', updateNutritionTargets);

router.get('/usda/search', searchUSDA);
router.get('/usda/:fdcId', getUSDANutrients);

export default router;
