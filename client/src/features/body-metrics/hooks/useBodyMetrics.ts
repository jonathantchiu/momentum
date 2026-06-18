import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export interface BodyMetric {
  id: string;
  userId: string;
  recordedAt: string;
  weightKg?: number | null;
  bodyFatPct?: number | null;
  muscleMassKg?: number | null;
  waterPct?: number | null;
  bmi?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  chestCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BodyMetricProgress {
  totalReadings: number;
  weightChangKg: number;
  bodyFatChangePct: number;
  latestWeight: number | null;
  latestBodyFat: number | null;
  latestBmi: number | null;
  trend: Array<{ date: string; weightKg: number | null; bodyFatPct: number | null; bmi: number | null }>;
}

export type CreateBodyMetricInput = Omit<BodyMetric, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

const KEYS = {
  all: ['body-metrics'] as const,
  list: (p?: object) => ['body-metrics', 'list', p] as const,
  progress: (days: number) => ['body-metrics', 'progress', days] as const,
};

export function useBodyMetrics(params?: { from?: string; to?: string; limit?: number }) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => api.get<{ data: BodyMetric[]; total: number }>('/body-metrics', { params }),
  });
}

export function useBodyMetricProgress(days: number = 90) {
  return useQuery({
    queryKey: KEYS.progress(days),
    queryFn: () => api.get<BodyMetricProgress>('/body-metrics/progress', { params: { days } }),
  });
}

export function useCreateBodyMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBodyMetricInput) => api.post<BodyMetric>('/body-metrics', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateBodyMetric(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateBodyMetricInput>) => api.put<BodyMetric>(`/body-metrics/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeleteBodyMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/body-metrics/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
