import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';

function headers() {
  const token = useAuthStore.getState().accessToken;
  return { Authorization: `Bearer ${token}` };
}

export function usePantryItems() {
  return useQuery({
    queryKey: ['pantry'],
    queryFn: async () => {
      const res = await api.get('/nutrition/pantry', { headers: headers() });
      return res.data.data;
    },
  });
}

export function useAddPantryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; quantity: number; unit: string; expiryDate?: string }) => {
      const res = await api.post('/nutrition/pantry', data, { headers: headers() });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pantry'] }),
  });
}

export function useUpdatePantryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const res = await api.put(`/nutrition/pantry/${id}`, data, { headers: headers() });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pantry'] }),
  });
}

export function useDeletePantryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/nutrition/pantry/${id}`, { headers: headers() });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pantry'] }),
  });
}
