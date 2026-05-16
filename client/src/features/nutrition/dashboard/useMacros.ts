import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';

function headers() {
  const token = useAuthStore.getState().accessToken;
  return { Authorization: `Bearer ${token}` };
}

export function useNutritionTargets() {
  return useQuery({
    queryKey: ['nutritionTargets'],
    queryFn: async () => {
      const res = await api.get('/nutrition/targets', { headers: headers() });
      return res.data.data;
    },
  });
}

export function useUpdateTargets() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, number>) => {
      const res = await api.put('/nutrition/targets', data, { headers: headers() });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nutritionTargets'] }),
  });
}
