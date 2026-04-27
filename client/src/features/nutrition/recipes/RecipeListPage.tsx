import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useRecipes } from './useRecipes';

export function Component() {
  const [search, setSearch] = useState('');
  const { data: recipes, isLoading } = useRecipes(search || undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
        <Link to="/nutrition/recipes/new">
          <Button>Add Recipe</Button>
        </Link>
      </div>

      <Input
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}

      {recipes?.length === 0 && (
        <EmptyState message="No recipes yet. Create your first recipe to get started." />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes?.map((recipe: Record<string, unknown>) => (
          <Link key={recipe.id as string} to={`/nutrition/recipes/${recipe.id}`}>
            <Card className="transition hover:shadow-md">
              <h3 className="font-semibold text-gray-900">{recipe.name as string}</h3>
              <div className="mt-2 flex gap-3 text-xs text-gray-500">
                <span>{(recipe._count as Record<string, number>)?.ingredients ?? 0} ingredients</span>
                {recipe.prepTimeMin && <span>{recipe.prepTimeMin as number}m prep</span>}
                {recipe.cookTimeMin && <span>{recipe.cookTimeMin as number}m cook</span>}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Component;
