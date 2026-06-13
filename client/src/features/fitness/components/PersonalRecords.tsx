import React from 'react';
import { usePersonalRecords } from '../hooks/useFitness';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Badge } from '../../../components/ui/Badge';

export function PersonalRecords() {
  const { data, isLoading, isError } = usePersonalRecords();
  const prs = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1,2,3,4].map((i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) return <p className="text-red-500 text-sm">Failed to load personal records.</p>;

  if (prs.length === 0) {
    return (
      <EmptyState
        title="No personal records yet"
        description="Log workouts to track your personal bests."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {prs.map((pr) => (
        <Card key={pr.id}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-gray-900">{pr.exercise.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(pr.achievedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              {pr.weightKg && (
                <p className="text-lg font-bold text-indigo-600">{pr.weightKg} kg</p>
              )}
              {pr.reps && pr.weightKg && (
                <p className="text-xs text-gray-500">{pr.reps} reps</p>
              )}
              {pr.distanceM && (
                <p className="text-lg font-bold text-indigo-600">{(pr.distanceM / 1000).toFixed(2)} km</p>
              )}
              {pr.durationSec && !pr.distanceM && (
                <p className="text-lg font-bold text-indigo-600">{Math.floor(pr.durationSec / 60)}:{String(pr.durationSec % 60).padStart(2, '0')}</p>
              )}
            </div>
          </div>
          <Badge className="mt-2" variant="secondary">{pr.exercise.category}</Badge>
        </Card>
      ))}
    </div>
  );
}
