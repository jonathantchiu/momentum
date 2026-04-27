import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useRecipe, useDeleteRecipe } from './useRecipes';

export function Component() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: recipe, isLoading } = useRecipe(id || '');
  const deleteMutation = useDeleteRecipe();

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (!recipe) return <p className="text-gray-500">Recipe not found.</p>;

  const totalMacros = recipe.ingredients.reduce(
    (acc: Record<string, number>, ing: Record<string, unknown>) => ({
      calories: acc.calories + ((ing.calories as number) ?? 0),
      proteinG: acc.proteinG + ((ing.proteinG as number) ?? 0),
      carbsG: acc.carbsG + ((ing.carbsG as number) ?? 0),
      fatG: acc.fatG + ((ing.fatG as number) ?? 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  const handleDelete = () => {
    if (confirm('Delete this recipe?')) {
      deleteMutation.mutate(recipe.id, { onSuccess: () => navigate('/nutrition/recipes') });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
          <div className="mt-1 flex gap-3 text-sm text-gray-500">
            <span>{recipe.servings} servings</span>
            {recipe.prepTimeMin && <span>{recipe.prepTimeMin}m prep</span>}
            {recipe.cookTimeMin && <span>{recipe.cookTimeMin}m cook</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/nutrition/recipes/${recipe.id}/edit`}>
            <Button variant="secondary" size="sm">Edit</Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      <Card title="Nutrition Summary">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{Math.round(totalMacros.calories)}</p>
            <p className="text-xs text-gray-500">Calories</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{Math.round(totalMacros.proteinG)}g</p>
            <p className="text-xs text-gray-500">Protein</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{Math.round(totalMacros.carbsG)}g</p>
            <p className="text-xs text-gray-500">Carbs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-rose-600">{Math.round(totalMacros.fatG)}g</p>
            <p className="text-xs text-gray-500">Fat</p>
          </div>
        </div>
      </Card>

      <Card title="Ingredients">
        <ul className="divide-y">
          {recipe.ingredients.map((ing: Record<string, unknown>) => (
            <li key={ing.id as string} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-900">{ing.name as string}</span>
              <div className="flex items-center gap-2">
                <Badge>{`${ing.quantity} ${ing.unit}`}</Badge>
                {(ing.calories as number) > 0 && (
                  <span className="text-xs text-gray-400">{ing.calories as number} cal</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {recipe.instructions && (
        <Card title="Instructions">
          <p className="whitespace-pre-wrap text-sm text-gray-700">{recipe.instructions}</p>
        </Card>
      )}
    </div>
  );
}

export default Component;
