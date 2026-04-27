import { createBrowserRouter } from 'react-router-dom';
import App from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, lazy: () => import('./features/auth/LoginPage') },
      { path: 'login', lazy: () => import('./features/auth/LoginPage') },
      { path: 'register', lazy: () => import('./features/auth/RegisterPage') },
      {
        path: 'dashboard',
        lazy: () => import('./features/dashboard/DashboardPage'),
      },
      {
        path: 'nutrition',
        lazy: () => import('./features/nutrition/NutritionLayout'),
        children: [
          { index: true, lazy: () => import('./features/nutrition/recipes/RecipeListPage') },
          { path: 'recipes', lazy: () => import('./features/nutrition/recipes/RecipeListPage') },
          { path: 'recipes/new', lazy: () => import('./features/nutrition/recipes/RecipeFormPage') },
          { path: 'recipes/:id', lazy: () => import('./features/nutrition/recipes/RecipeDetailPage') },
          { path: 'recipes/:id/edit', lazy: () => import('./features/nutrition/recipes/RecipeFormPage') },
          { path: 'meal-plan', lazy: () => import('./features/nutrition/meal-planner/MealPlannerPage') },
          { path: 'pantry', lazy: () => import('./features/nutrition/pantry/PantryPage') },
          { path: 'shopping-list', lazy: () => import('./features/nutrition/shopping-list/ShoppingListPage') },
          { path: 'macros', lazy: () => import('./features/nutrition/dashboard/MacroDashboardPage') },
        ],
      },
    ],
  },
]);
