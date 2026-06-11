import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment?: string | null;
  instructions?: string | null;
  isCustom: boolean;
}

export interface WorkoutSet {
  id: string;
  sessionId: string;
  exerciseId: string;
  exercise: Exercise;
  setNumber: number;
  reps?: number | null;
  weightKg?: number | null;
  durationSec?: number | null;
  distanceM?: number | null;
  notes?: string | null;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  name?: string | null;
  startedAt: string;
  endedAt?: string | null;
  durationMin?: number | null;
  notes?: string | null;
  sets: WorkoutSet[];
  createdAt: string;
  updatedAt: string;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  exercise: Exercise;
  weightKg?: number | null;
  reps?: number | null;
  distanceM?: number | null;
  durationSec?: number | null;
  achievedAt: string;
}

export interface WorkoutStats {
  totalSessions: number;
  totalDurationMin: number;
  totalSets: number;
  totalVolumeKg: number;
  avgSessionDurationMin: number;
}

const KEYS = {
  all: ['fitness'] as const,
  exercises: (p?: object) => ['fitness', 'exercises', p] as const,
  sessions: (p?: object) => ['fitness', 'sessions', p] as const,
  session: (id: string) => ['fitness', 'session', id] as const,
  prs: () => ['fitness', 'personal-records'] as const,
  stats: (days: number) => ['fitness', 'stats', days] as const,
};

export function useExercises(params?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: KEYS.exercises(params),
    queryFn: () => api.get<{ data: Exercise[]; total: number }>('/fitness/exercises', { params }),
  });
}

export function useWorkoutSessions(params?: { from?: string; to?: string; limit?: number }) {
  return useQuery({
    queryKey: KEYS.sessions(params),
    queryFn: () =>
      api.get<{ data: WorkoutSession[]; total: number }>('/fitness/sessions', { params }),
  });
}

export function useWorkoutSession(id: string) {
  return useQuery({
    queryKey: KEYS.session(id),
    queryFn: () => api.get<WorkoutSession>(`/fitness/sessions/${id}`),
    enabled: !!id,
  });
}

export function usePersonalRecords() {
  return useQuery({
    queryKey: KEYS.prs(),
    queryFn: () => api.get<PersonalRecord[]>('/fitness/personal-records'),
  });
}

export function useWorkoutStats(days: number = 30) {
  return useQuery({
    queryKey: KEYS.stats(days),
    queryFn: () => api.get<WorkoutStats>('/fitness/stats', { params: { days } }),
  });
}

export function useCreateWorkoutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name?: string;
      startedAt: string;
      endedAt?: string;
      notes?: string;
      sets?: Array<{ exerciseId: string; setNumber: number; reps?: number; weightKg?: number }>;
    }) => api.post<WorkoutSession>('/fitness/sessions', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAddSet(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      exerciseId: string;
      setNumber: number;
      reps?: number;
      weightKg?: number;
      durationSec?: number;
      distanceM?: number;
    }) => api.post<WorkoutSet>(`/fitness/sessions/${sessionId}/sets`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.session(sessionId) });
      qc.invalidateQueries({ queryKey: KEYS.prs() });
    },
  });
}

export function useDeleteWorkoutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/fitness/sessions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
