import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';

export function useRecipes(search?: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['recipes', search],
    queryFn: async () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await api.get(`/nutrition/recipes${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    },
  });
}

export function useRecipe(id: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const res = await api.get(`/nutrition/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post('/nutrition/recipes', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

export function useUpdateRecipe() {
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const res = await api.put(`/nutrition/recipes/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

export function useDeleteRecipe() {
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/nutrition/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  });
}
