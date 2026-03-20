import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

interface AuthResponse {
  data: { user: { id: string; email: string; name: string; createdAt: string }; accessToken: string };
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: { email: string; name: string; password: string }) => {
      const res = await api.post<AuthResponse>('/auth/register', data);
      return res.data.data;
    },
    onSuccess: ({ user, accessToken }) => {
      setAuth(user, accessToken);
      navigate('/dashboard');
    },
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post<AuthResponse>('/auth/login', data);
      return res.data.data;
    },
    onSuccess: ({ user, accessToken }) => {
      setAuth(user, accessToken);
      navigate('/dashboard');
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      clearAuth();
      navigate('/login');
    },
  });
}
