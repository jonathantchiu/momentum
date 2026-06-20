import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useCreateSleepLog, useUpdateSleepLog, type SleepLog, type CreateSleepLogInput } from '../hooks/useSleep';

interface Props {
  existing?: SleepLog;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SleepLogForm({ existing, onSuccess, onCancel }: Props) {
  const [bedtime, setBedtime] = useState(
    existing ? existing.bedtime.slice(0, 16) : ''
  );
  const [wakeTime, setWakeTime] = useState(
    existing ? existing.wakeTime.slice(0, 16) : ''
  );
  const [quality, setQuality] = useState<number>(existing?.quality ?? 3);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [error, setError] = useState('');

  const create = useCreateSleepLog();
  const update = useUpdateSleepLog(existing?.id ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const input: CreateSleepLogInput = {
        bedtime: new Date(bedtime).toISOString(),
        wakeTime: new Date(wakeTime).toISOString(),
        quality,
        notes: notes || undefined,
      };
      if (existing) {
        await update.mutateAsync(input);
      } else {
        await create.mutateAsync(input);
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Failed to save sleep log');
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bedtime</label>
        <Input
          type="datetime-local"
          value={bedtime}
          onChange={(e) => setBedtime(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Wake Time</label>
        <Input
          type="datetime-local"
          value={wakeTime}
          onChange={(e) => setWakeTime(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sleep Quality: {quality}/5
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>Poor</span><span>Excellent</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="How did you sleep?"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : existing ? 'Update Log' : 'Log Sleep'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
