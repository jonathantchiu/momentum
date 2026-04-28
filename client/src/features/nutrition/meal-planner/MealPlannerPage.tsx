import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { MealSlot } from './MealSlot';
import { useMealPlan, useAddMealPlanItem, useRemoveMealPlanItem } from './useMealPlan';
import { useRecipes } from '../recipes/useRecipes';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

function getMonday(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

export function Component() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [pickerSlot, setPickerSlot] = useState<{ dayOfWeek: number; mealType: string } | null>(null);

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekStart = getMonday(baseDate);

  const { data: plan } = useMealPlan(weekStart);
  const { data: recipes } = useRecipes();
  const addItem = useAddMealPlanItem();
  const removeItem = useRemoveMealPlanItem();

  const getItems = (dayOfWeek: number, mealType: string) =>
    plan?.items?.filter(
      (i: Record<string, unknown>) => i.dayOfWeek === dayOfWeek && i.mealType === mealType
    ) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meal Planner</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setWeekOffset((w) => w - 1)}>
            &larr; Prev
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setWeekOffset(0)}>
            This Week
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>
            Next &rarr;
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-500">Week of {weekStart}</p>

      <Card>
        <div className="grid grid-cols-8 gap-2">
          <div />
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500">{d}</div>
          ))}

          {MEALS.map((meal) => (
            <>
              <div key={meal} className="flex items-center text-xs font-medium capitalize text-gray-500">
                {meal}
              </div>
              {DAYS.map((_, dayIdx) => (
                <div
                  key={`${meal}-${dayIdx}`}
                  className="min-h-[4rem] cursor-pointer rounded border border-gray-100 p-1 hover:bg-gray-50"
                  onClick={() => setPickerSlot({ dayOfWeek: dayIdx, mealType: meal })}
                >
                  <MealSlot
                    items={getItems(dayIdx, meal)}
                    onRemove={(id) => removeItem.mutate(id)}
                  />
                </div>
              ))}
            </>
          ))}
        </div>
      </Card>

      <Modal
        open={!!pickerSlot}
        onClose={() => setPickerSlot(null)}
        title="Add Recipe"
      >
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {recipes?.map((r: Record<string, unknown>) => (
            <button
              key={r.id as string}
              className="w-full rounded px-3 py-2 text-left text-sm hover:bg-indigo-50"
              onClick={() => {
                if (pickerSlot) {
                  addItem.mutate({
                    weekStart,
                    recipeId: r.id as string,
                    dayOfWeek: pickerSlot.dayOfWeek,
                    mealType: pickerSlot.mealType,
                  });
                  setPickerSlot(null);
                }
              }}
            >
              {r.name as string}
            </button>
          ))}
          {recipes?.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-400">No recipes yet</p>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Component;
