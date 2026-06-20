import React, { useState } from 'react';
import { SleepLogForm } from '../components/SleepLogForm';
import { SleepTrendsChart } from '../components/SleepTrendsChart';
import { useSleepLogs, useDeleteSleepLog, type SleepLog } from '../hooks/useSleep';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Tabs } from '../../../components/ui/Tabs';

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

function QualityBadge({ q }: { q: number }) {
  const colors = ['', 'bg-red-100 text-red-700', 'bg-orange-100 text-orange-700', 'bg-yellow-100 text-yellow-700', 'bg-green-100 text-green-700', 'bg-emerald-100 text-emerald-700'];
  const labels = ['', 'Poor', 'Fair', 'Okay', 'Good', 'Excellent'];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[q]}`}>
      {labels[q]}
    </span>
  );
}

export default function SleepPage() {
  const [tab, setTab] = useState<'logs' | 'trends'>('logs');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SleepLog | null>(null);
  const [trendDays, setTrendDays] = useState(30);

  const { data, isLoading } = useSleepLogs({ limit: 50 });
  const deleteMutation = useDeleteSleepLog();

  const logs: SleepLog[] = data?.data?.data ?? data?.data ?? [];

  const handleDelete = async (id: string) => {
    if (confirm('Delete this sleep log?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sleep Tracker</h1>
        <Button onClick={() => setShowForm(true)}>Log Sleep</Button>
      </div>

      <Tabs
        tabs={[
          { id: 'logs', label: 'Sleep Logs' },
          { id: 'trends', label: 'Trends' },
        ]}
        activeTab={tab}
        onChange={(id) => setTab(id as 'logs' | 'trends')}
      />

      {tab === 'trends' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setTrendDays(d)}
                className={`px-3 py-1 rounded-full text-sm ${
                  trendDays === d
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <SleepTrendsChart days={trendDays} />
        </div>
      )}

      {tab === 'logs' && (
        <div className="space-y-3">
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && logs.length === 0 && (
            <EmptyState
              title="No sleep logs yet"
              description="Start tracking your sleep to see trends and insights."
              action={<Button onClick={() => setShowForm(true)}>Log First Sleep</Button>}
            />
          )}

          {logs.map((log) => (
            <Card key={log.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(log.bedtime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(log.bedtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &rarr; {new Date(log.wakeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    &nbsp;&bull;&nbsp;{formatDuration(log.durationMin)}
                  </p>
                  {log.notes && <p className="text-sm text-gray-400 mt-1">{log.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <QualityBadge q={log.quality} />
                  <button
                    className="text-gray-400 hover:text-indigo-600 text-sm"
                    onClick={() => setEditing(log)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-gray-400 hover:text-red-600 text-sm"
                    onClick={() => handleDelete(log.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm || !!editing}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Edit Sleep Log' : 'Log Sleep'}
      >
        <SleepLogForm
          existing={editing ?? undefined}
          onSuccess={() => { setShowForm(false); setEditing(null); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}
