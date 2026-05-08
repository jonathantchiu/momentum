import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PantryItemForm } from './PantryItemForm';
import { usePantryItems, useAddPantryItem, useDeletePantryItem } from './usePantry';

function expiryStatus(dateStr: string | null): 'danger' | 'warning' | 'success' {
  if (!dateStr) return 'success';
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (days < 3) return 'danger';
  if (days < 7) return 'warning';
  return 'success';
}

export function Component() {
  const { data: items } = usePantryItems();
  const addItem = useAddPantryItem();
  const deleteItem = useDeletePantryItem();

  const expiring = items?.filter(
    (i: Record<string, unknown>) => i.expiryDate && expiryStatus(i.expiryDate as string) !== 'success'
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pantry</h1>

      {expiring?.length > 0 && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          {expiring.length} item(s) expiring soon
        </div>
      )}

      <Card title="Add Item">
        <PantryItemForm onSubmit={(data) => addItem.mutate(data)} loading={addItem.isPending} />
      </Card>

      {items?.length === 0 && <EmptyState message="Your pantry is empty." />}

      {items?.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2">Item</th>
                <th className="pb-2">Quantity</th>
                <th className="pb-2">Expiry</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item: Record<string, unknown>) => (
                <tr key={item.id as string}>
                  <td className="py-2 font-medium text-gray-900">{item.name as string}</td>
                  <td className="py-2 text-gray-600">{item.quantity as number} {item.unit as string}</td>
                  <td className="py-2">
                    {item.expiryDate ? (
                      <Badge variant={expiryStatus(item.expiryDate as string)}>
                        {new Date(item.expiryDate as string).toLocaleDateString()}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => deleteItem.mutate(item.id as string)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

export default Component;
