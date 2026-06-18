import React, { useState } from 'react';
import { useBodyMetrics, useBodyMetricProgress, useCreateBodyMetric, useDeleteBodyMetric, type BodyMetric, type CreateBodyMetricInput } from '../hooks/useBodyMetrics';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Tabs } from '../../../components/ui/Tabs';

function BodyMetricForm({ onSuccess, onCancel }: { onSuccess?: () => void; onCancel?: () => void }) {
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().slice(0, 16));
  const [weightKg, setWeightKg] = useState('');
  const [bodyFatPct, setBodyFatPct] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const create = useCreateBodyMetric();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const input: CreateBodyMetricInput = {
        recordedAt: new Date(recordedAt).toISOString(),
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        bodyFatPct: bodyFatPct ? parseFloat(bodyFatPct) : undefined,
        waistCm: waistCm ? parseFloat(waistCm) : undefined,
        notes: notes || undefined,
      };
      await create.mutateAsync(input);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Failed to save metric');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
        <Input type="datetime-local" value={recordedAt} onChange={(e) => setRecordedAt(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <Input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="75.0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Body Fat (%)</label>
          <Input type="number" step="0.1" value={bodyFatPct} onChange={(e) => setBodyFatPct(e.target.value)} placeholder="18.5" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Waist (cm)</label>
          <Input type="number" step="0.1" value={waistCm} onChange={(e) => setWaistCm(e.target.value)} placeholder="80" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Saving...' : 'Save Metrics'}</Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}

export default function BodyMetricsPage() {
  const [tab, setTab] = useState<'history' | 'progress'>('history');
  const [showForm, setShowForm] = useState(false);
  const [progressDays, setProgressDays] = useState(90);

  const { data, isLoading } = useBodyMetrics({ limit: 50 });
  const { data: progressData } = useBodyMetricProgress(progressDays);
  const deleteMutation = useDeleteBodyMetric();

  const metrics: BodyMetric[] = data?.data?.data ?? data?.data ?? [];
  const progress = progressData?.data ?? progressData;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Body Metrics</h1>
        <Button onClick={() => setShowForm(true)}>Log Metrics</Button>
      </div>

      <Tabs
        tabs={[{ id: 'history', label: 'History' }, { id: 'progress', label: 'Progress' }]}
        activeTab={tab}
        onChange={(id) => setTab(id as any)}
      />

      {tab === 'progress' && progress && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {[30, 60, 90, 180].map((d) => (
              <button key={d} onClick={() => setProgressDays(d)}
                className={`px-3 py-1 rounded-full text-sm ${progressDays === d ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {d}d
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Current Weight</p>
              <p className="text-2xl font-bold text-indigo-600">{progress.latestWeight ? `${progress.latestWeight} kg` : '—'}</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Weight Change</p>
              <p className={`text-2xl font-bold ${progress.weightChangKg < 0 ? 'text-green-600' : progress.weightChangKg > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {progress.weightChangKg > 0 ? '+' : ''}{progress.weightChangKg} kg
              </p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Body Fat</p>
              <p className="text-2xl font-bold text-indigo-600">{progress.latestBodyFat ? `${progress.latestBodyFat}%` : '—'}</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wide">BMI</p>
              <p className="text-2xl font-bold text-gray-800">{progress.latestBmi?.toFixed(1) ?? '—'}</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Readings</p>
              <p className="text-2xl font-bold text-gray-800">{progress.totalReadings}</p>
            </Card>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {isLoading && [1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />)}
          {!isLoading && metrics.length === 0 && (
            <EmptyState title="No metrics logged" description="Start tracking your body metrics to see progress."
              action={<Button onClick={() => setShowForm(true)}>Log First Metric</Button>} />
          )}
          {metrics.map((m) => (
            <Card key={m.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{new Date(m.recordedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <p className="text-sm text-gray-500">
                    {m.weightKg ? `${m.weightKg} kg` : ''}
                    {m.bodyFatPct ? ` · ${m.bodyFatPct}% body fat` : ''}
                    {m.waistCm ? ` · waist: ${m.waistCm}cm` : ''}
                  </p>
                </div>
                <button onClick={() => deleteMutation.mutate(m.id)} className="text-gray-400 hover:text-red-600 text-sm">Delete</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Log Body Metrics">
        <BodyMetricForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
