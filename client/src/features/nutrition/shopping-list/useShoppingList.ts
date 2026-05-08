import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';

export function useShoppingList(weekStart?: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['shoppingList', weekStart],
    queryFn: async () => {
      const params = weekStart ? `?weekStart=${weekStart}` : '';
      const res = await api.get(`/nutrition/shopping-list${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    },
  });
}
