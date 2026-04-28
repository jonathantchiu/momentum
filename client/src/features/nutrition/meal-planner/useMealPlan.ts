import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';

function headers() {
  const token = useAuthStore.getState().accessToken;
  return { Authorization: `Bearer ${token}` };
}

export function useMealPlan(weekStart?: string) {
  return useQuery({
    queryKey: ['mealPlan', weekStart],
    queryFn: async () => {
      const params = weekStart ? `?weekStart=${weekStart}` : '';
      const res = await api.get(`/nutrition/meal-plans${params}`, { headers: headers() });
      return res.data.data;
    },
  });
}

export function useAddMealPlanItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ weekStart, ...data }: { weekStart?: string; recipeId: string; dayOfWeek: number; mealType: string }) => {
      const params = weekStart ? `?weekStart=${weekStart}` : '';
      const res = await api.post(`/nutrition/meal-plans/items${params}`, data, { headers: headers() });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mealPlan'] }),
  });
}

export function useRemoveMealPlanItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/nutrition/meal-plans/items/${id}`, { headers: headers() });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mealPlan'] }),
  });
}

export function useMoveMealPlanItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; dayOfWeek: number; mealType: string }) => {
      const res = await api.put(`/nutrition/meal-plans/items/${id}`, data, { headers: headers() });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mealPlan'] }),
  });
}
