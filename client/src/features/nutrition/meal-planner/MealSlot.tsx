interface MealSlotProps {
  items: Array<{ id: string; recipe: { id: string; name: string } }>;
  onRemove: (id: string) => void;
}

export function MealSlot({ items, onRemove }: MealSlotProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-16 items-center justify-center rounded border-2 border-dashed border-gray-200 text-xs text-gray-400">
        Empty
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded bg-indigo-50 px-2 py-1 text-xs"
        >
          <span className="truncate text-indigo-700">{item.recipe.name}</span>
          <button
            onClick={() => onRemove(item.id)}
            className="ml-1 text-indigo-400 hover:text-red-500"
          >
            &#x2715;
          </button>
        </div>
      ))}
    </div>
  );
}
