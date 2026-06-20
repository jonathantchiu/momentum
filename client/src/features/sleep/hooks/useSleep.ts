import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export interface SleepLog {
  id: string;
  userId: string;
  bedtime: string;
  wakeTime: string;
  durationMin: number;
  quality: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SleepTrends {
  avgDurationMin: number;
  avgQuality: number;
  totalNights: number;
  longestSleepMin: number;
  shortestSleepMin: number;
  consistencyScore: number;
  dailyBreakdown: Array<{ date: string; durationMin: number; quality: number }>;
}

export interface CreateSleepLogInput {
  bedtime: string;
  wakeTime: string;
  quality: number;
  notes?: string;
}

const KEYS = {
  all: ['sleep'] as const,
  logs: (params?: object) => ['sleep', 'logs', params] as const,
  log: (id: string) => ['sleep', 'log', id] as const,
  trends: (days: number) => ['sleep', 'trends', days] as const,
};

export function useSleepLogs(params?: { from?: string; to?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: KEYS.logs(params),
    queryFn: () =>
      api.get<{ data: SleepLog[]; total: number; limit: number; offset: number }>('/sleep', { params }),
  });
}

export function useSleepLog(id: string) {
  return useQuery({
    queryKey: KEYS.log(id),
    queryFn: () => api.get<SleepLog>(`/sleep/${id}`),
    enabled: !!id,
  });
}

export function useSleepTrends(days: number = 30) {
  return useQuery({
    queryKey: KEYS.trends(days),
    queryFn: () => api.get<SleepTrends>('/sleep/trends', { params: { days } }),
  });
}

export function useCreateSleepLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSleepLogInput) => api.post<SleepLog>('/sleep', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateSleepLog(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateSleepLogInput>) => api.put<SleepLog>(`/sleep/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeleteSleepLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/sleep/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
