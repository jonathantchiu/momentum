import React from 'react';
import { useSleepTrends } from '../hooks/useSleep';
import { Card } from '../../../components/ui/Card';

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

interface Props {
  days?: number;
}

export function SleepTrendsChart({ days = 30 }: Props) {
  const { data, isLoading, isError } = useSleepTrends(days);

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <p className="text-red-500 text-sm">Failed to load sleep trends.</p>
      </Card>
    );
  }

  const trends = data.data ?? data;

  const maxDuration = Math.max(...trends.dailyBreakdown.map((d) => d.durationMin), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Duration</p>
          <p className="text-2xl font-bold text-indigo-600">{formatDuration(trends.avgDurationMin)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Quality</p>
          <p className="text-2xl font-bold text-indigo-600">{trends.avgQuality.toFixed(1)}/5</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Consistency</p>
          <p className="text-2xl font-bold text-indigo-600">{trends.consistencyScore}%</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Nights</p>
          <p className="text-2xl font-bold text-gray-800">{trends.totalNights}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Longest Sleep</p>
          <p className="text-2xl font-bold text-gray-800">{formatDuration(trends.longestSleepMin)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Shortest Sleep</p>
          <p className="text-2xl font-bold text-gray-800">{formatDuration(trends.shortestSleepMin)}</p>
        </Card>
      </div>

      {trends.dailyBreakdown.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Daily Duration</h3>
          <div className="flex items-end gap-1 h-32">
            {trends.dailyBreakdown.slice(-14).map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-indigo-400 rounded-t"
                  style={{ height: `${(day.durationMin / maxDuration) * 100}%` }}
                  title={`${day.date}: ${formatDuration(day.durationMin)}`}
                />
                <span className="text-xs text-gray-400 hidden sm:block">
                  {day.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
