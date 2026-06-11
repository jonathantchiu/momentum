import React, { useState } from 'react';
import { useExercises, type Exercise } from '../hooks/useFitness';
import { Input } from '../../../components/ui/Input';

interface Props {
  onSelect: (exercise: Exercise) => void;
  selectedId?: string;
}

export function ExercisePicker({ onSelect, selectedId }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data, isLoading } = useExercises({ search: search || undefined, category: category || undefined });
  const exercises: Exercise[] = data?.data?.data ?? data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All</option>
          <option value="strength">Strength</option>
          <option value="cardio">Cardio</option>
          <option value="flexibility">Flexibility</option>
          <option value="sport">Sport</option>
        </select>
      </div>

      {isLoading && <p className="text-sm text-gray-400">Loading exercises...</p>}

      <ul className="max-h-60 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-md">
        {exercises.map((ex) => (
          <li
            key={ex.id}
            onClick={() => onSelect(ex)}
            className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 transition-colors ${
              selectedId === ex.id ? 'bg-indigo-50 font-medium' : ''
            }`}
          >
            <p className="text-sm font-medium text-gray-800">{ex.name}</p>
            <p className="text-xs text-gray-400">{ex.category} &bull; {ex.muscleGroups.join(', ')}</p>
          </li>
        ))}
        {!isLoading && exercises.length === 0 && (
          <li className="px-3 py-4 text-sm text-gray-400 text-center">No exercises found</li>
        )}
      </ul>
    </div>
  );
}
