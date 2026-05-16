import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useShoppingList } from './useShoppingList';

export function Component() {
  const { data: items, isLoading } = useShoppingList();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    const next = new Set(checked);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setChecked(next);
  };

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>

      {(!items || items.length === 0) && (
        <EmptyState message="No items needed. Add recipes to your meal plan first." />
      )}

      {items?.length > 0 && (
        <Card>
          <ul className="divide-y">
            {items.map((item: Record<string, unknown>) => (
              <li
                key={item.name as string}
                className={`flex cursor-pointer items-center justify-between py-3 ${
                  checked.has(item.name as string) ? 'opacity-40' : ''
                }`}
                onClick={() => toggle(item.name as string)}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked.has(item.name as string)}
                    readOnly
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span
                    className={`text-sm ${
                      checked.has(item.name as string) ? 'line-through text-gray-400' : 'text-gray-900'
                    }`}
                  >
                    {item.name as string}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Need: {item.need as number} {item.unit as string}
                  {(item.have as number) > 0 && ` (have ${item.have})`}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export default Component;
