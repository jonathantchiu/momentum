import { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

interface PantryItemFormProps {
  onSubmit: (data: { name: string; quantity: number; unit: string; expiryDate?: string }) => void;
  loading?: boolean;
  initial?: { name: string; quantity: number; unit: string; expiryDate?: string };
}

export function PantryItemForm({ onSubmit, loading, initial }: PantryItemFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() ?? '');
  const [unit, setUnit] = useState(initial?.unit ?? 'g');
  const [expiryDate, setExpiryDate] = useState(initial?.expiryDate?.split('T')[0] ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      quantity: Number(quantity),
      unit,
      expiryDate: expiryDate || undefined,
    });
    if (!initial) {
      setName('');
      setQuantity('');
      setExpiryDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <Input id="pname" label="Item" value={name} onChange={(e) => setName(e.target.value)} required className="w-40" />
      <Input id="pqty" label="Qty" type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="w-20" />
      <Input id="punit" label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} required className="w-16" />
      <Input id="pexpiry" label="Expiry" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-36" />
      <Button type="submit" loading={loading} size="sm">{initial ? 'Update' : 'Add'}</Button>
    </form>
  );
}
