import React, { useState } from 'react';
import { useWorkoutSessions, useWorkoutStats, useDeleteWorkoutSession } from '../hooks/useFitness';
import { PersonalRecords } from '../components/PersonalRecords';
import { WorkoutSessionForm } from '../components/WorkoutSessionForm';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Tabs } from '../../../components/ui/Tabs';

export default function FitnessPage() {
  const [tab, setTab] = useState<'sessions' | 'prs' | 'stats'>('sessions');
  const [showForm, setShowForm] = useState(false);
  const [statsDays, setStatsDays] = useState(30);

  const { data, isLoading } = useWorkoutSessions({ limit: 50 });
  const { data: statsData } = useWorkoutStats(statsDays);
  const deleteMutation = useDeleteWorkoutSession();

  const sessions = data?.data?.data ?? data?.data ?? [];
  const stats = statsData?.data ?? statsData;

  const handleDelete = async (id: string) => {
    if (confirm('Delete this workout session?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fitness Tracker</h1>
        <Button onClick={() => setShowForm(true)}>Log Workout</Button>
      </div>

      <Tabs
        tabs={[
          { id: 'sessions', label: 'Sessions' },
          { id: 'prs', label: 'Personal Records' },
          { id: 'stats', label: 'Stats' },
        ]}
        activeTab={tab}
        onChange={(id) => setTab(id as any)}
      />

      {tab === 'sessions' && (
        <div className="space-y-3">
          {isLoading && (
            <div className="space-y-2">
              {[1,2,3].map((i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />)}
            </div>
          )}
          {!isLoading && sessions.length === 0 && (
            <EmptyState
              title="No workouts logged"
              description="Start logging workouts to track your progress."
              action={<Button onClick={() => setShowForm(true)}>Log First Workout</Button>}
            />
          )}
          {sessions.map((session) => (
            <Card key={session.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {session.name || 'Workout'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(session.startedAt).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}
                    {session.durationMin ? ` · ${session.durationMin} min` : ''}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {session.sets.length} sets across {new Set(session.sets.map((s) => s.exerciseId)).size} exercises
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(session.id)}
                  className="text-gray-400 hover:text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'prs' && <PersonalRecords />}

      {tab === 'stats' && stats && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setStatsDays(d)}
                className={`px-3 py-1 rounded-full text-sm ${
                  statsDays === d ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Sessions</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalSessions}</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Sets</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalSets}</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Volume</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalVolumeKg.toLocaleString()} kg</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Time</p>
              <p className="text-3xl font-bold text-gray-800">{Math.floor(stats.totalDurationMin / 60)}h {stats.totalDurationMin % 60}m</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Duration</p>
              <p className="text-3xl font-bold text-gray-800">{stats.avgSessionDurationMin} min</p>
            </Card>
          </div>
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Log Workout Session"
      >
        <WorkoutSessionForm
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}
