import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ExercisePicker } from './ExercisePicker';
import { useCreateWorkoutSession, type Exercise } from '../hooks/useFitness';

interface SetDraft {
  exercise: Exercise;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  durationSec?: number;
  distanceM?: number;
}

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function WorkoutSessionForm({ onSuccess, onCancel }: Props) {
  const [name, setName] = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [endedAt, setEndedAt] = useState('');
  const [notes, setNotes] = useState('');
  const [sets, setSets] = useState<SetDraft[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentReps, setCurrentReps] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [error, setError] = useState('');

  const createSession = useCreateWorkoutSession();

  const addSet = () => {
    if (!selectedExercise) return;
    const exerciseSets = sets.filter((s) => s.exercise.id === selectedExercise.id);
    setSets((prev) => [
      ...prev,
      {
        exercise: selectedExercise,
        setNumber: exerciseSets.length + 1,
        reps: currentReps ? parseInt(currentReps) : undefined,
        weightKg: currentWeight ? parseFloat(currentWeight) : undefined,
      },
    ]);
    setCurrentReps('');
    setCurrentWeight('');
  };

  const removeSet = (index: number) => {
    setSets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!startedAt) { setError('Start time is required'); return; }
    try {
      await createSession.mutateAsync({
        name: name || undefined,
        startedAt: new Date(startedAt).toISOString(),
        endedAt: endedAt ? new Date(endedAt).toISOString() : undefined,
        notes: notes || undefined,
        sets: sets.map((s) => ({
          exerciseId: s.exercise.id,
          setNumber: s.setNumber,
          reps: s.reps,
          weightKg: s.weightKg,
          durationSec: s.durationSec,
          distanceM: s.distanceM,
        })),
      });
      onSuccess?.();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Failed to save workout');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Workout Name</label>
          <Input placeholder="e.g. Push Day" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <Input type="datetime-local" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <Input type="datetime-local" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Add Sets</label>
        <ExercisePicker onSelect={setSelectedExercise} selectedId={selectedExercise?.id} />
        {selectedExercise && (
          <div className="mt-2 flex gap-2 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Reps</label>
              <Input
                type="number"
                min={1}
                value={currentReps}
                onChange={(e) => setCurrentReps(e.target.value)}
                className="w-20"
                placeholder="12"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Weight (kg)</label>
              <Input
                type="number"
                min={0}
                step={0.5}
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="w-24"
                placeholder="60"
              />
            </div>
            <Button type="button" onClick={addSet} variant="outline">Add Set</Button>
          </div>
        )}
      </div>

      {sets.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Sets ({sets.length})</h4>
          <ul className="space-y-1">
            {sets.map((s, i) => (
              <li key={i} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-1.5 rounded">
                <span className="text-gray-700">{s.exercise.name} — Set {s.setNumber}</span>
                <span className="text-gray-500">
                  {s.reps ? `${s.reps} reps` : ''}{s.weightKg ? ` @ ${s.weightKg}kg` : ''}
                </span>
                <button type="button" onClick={() => removeSet(i)} className="text-red-400 hover:text-red-600 text-xs">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={createSession.isPending}>
          {createSession.isPending ? 'Saving...' : 'Save Workout'}
        </Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}
