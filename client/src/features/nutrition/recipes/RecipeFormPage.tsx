import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useRecipe, useCreateRecipe, useUpdateRecipe } from './useRecipes';

interface IngredientRow {
  name: string;
  quantity: string;
  unit: string;
}

export function Component() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { data: existing } = useRecipe(id || '');
  const createMutation = useCreateRecipe();
  const updateMutation = useUpdateRecipe();

  const [name, setName] = useState('');
  const [servings, setServings] = useState('1');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    { name: '', quantity: '', unit: 'g' },
  ]);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setServings(String(existing.servings));
      setPrepTime(existing.prepTimeMin ? String(existing.prepTimeMin) : '');
      setCookTime(existing.cookTimeMin ? String(existing.cookTimeMin) : '');
      setInstructions(existing.instructions || '');
      setIngredients(
        existing.ingredients.map((i: Record<string, unknown>) => ({
          name: i.name as string,
          quantity: String(i.quantity),
          unit: i.unit as string,
        }))
      );
    }
  }, [existing]);

  const addRow = () => setIngredients([...ingredients, { name: '', quantity: '', unit: 'g' }]);

  const removeRow = (idx: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== idx));
    }
  };

  const updateRow = (idx: number, field: keyof IngredientRow, value: string) => {
    const updated = [...ingredients];
    updated[idx] = { ...updated[idx], [field]: value };
    setIngredients(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      servings: Number(servings),
      prepTimeMin: prepTime ? Number(prepTime) : undefined,
      cookTimeMin: cookTime ? Number(cookTime) : undefined,
      instructions,
      ingredients: ingredients
        .filter((i) => i.name && i.quantity)
        .map((i) => ({ name: i.name, quantity: Number(i.quantity), unit: i.unit })),
    };

    if (isEdit) {
      updateMutation.mutate({ id, ...payload }, { onSuccess: () => navigate(`/nutrition/recipes/${id}`) });
    } else {
      createMutation.mutate(payload, { onSuccess: (data) => navigate(`/nutrition/recipes/${data.id}`) });
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card title={isEdit ? 'Edit Recipe' : 'New Recipe'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" label="Recipe Name" value={name} onChange={(e) => setName(e.target.value)} required />

          <div className="grid grid-cols-3 gap-4">
            <Input id="servings" label="Servings" type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} />
            <Input id="prep" label="Prep (min)" type="number" min="0" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
            <Input id="cook" label="Cook (min)" type="number" min="0" value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Ingredients</label>
            {ingredients.map((ing, idx) => (
              <div key={idx} className="mb-2 flex gap-2">
                <input
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Ingredient name"
                  value={ing.name}
                  onChange={(e) => updateRow(idx, 'name', e.target.value)}
                />
                <input
                  className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Qty"
                  type="number"
                  value={ing.quantity}
                  onChange={(e) => updateRow(idx, 'quantity', e.target.value)}
                />
                <input
                  className="w-16 rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Unit"
                  value={ing.unit}
                  onChange={(e) => updateRow(idx, 'unit', e.target.value)}
                />
                <button type="button" onClick={() => removeRow(idx)} className="text-red-500 hover:text-red-700">
                  &#x2715;
                </button>
              </div>
            ))}
            <button type="button" onClick={addRow} className="text-sm text-indigo-600 hover:underline">
              + Add ingredient
            </button>
          </div>

          <div>
            <label htmlFor="instructions" className="mb-1 block text-sm font-medium text-gray-700">
              Instructions
            </label>
            <textarea
              id="instructions"
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {isEdit ? 'Update' : 'Create'} Recipe
            </Button>
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Component;
