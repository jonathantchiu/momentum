import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuthStore } from './features/auth/store/authStore';
import { AppLayout } from './components/layout/AppLayout';

const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const NutritionPage = lazy(() => import('./features/nutrition/pages/NutritionPage'));
const SleepPage = lazy(() => import('./features/sleep/pages/SleepPage'));
const FitnessPage = lazy(() => import('./features/fitness/pages/FitnessPage'));
const BodyMetricsPage = lazy(() => import('./features/body-metrics/pages/BodyMetricsPage'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  { path: '/login', element: <Suspense fallback={null}><LoginPage /></Suspense> },
  { path: '/register', element: <Suspense fallback={null}><RegisterPage /></Suspense> },
  {
    path: '/',
    element: <PrivateRoute><AppLayout /></PrivateRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Suspense fallback={null}><DashboardPage /></Suspense> },
      { path: 'nutrition/*', element: <Suspense fallback={null}><NutritionPage /></Suspense> },
      { path: 'sleep', element: <Suspense fallback={null}><SleepPage /></Suspense> },
      { path: 'fitness/*', element: <Suspense fallback={null}><FitnessPage /></Suspense> },
      { path: 'body-metrics', element: <Suspense fallback={null}><BodyMetricsPage /></Suspense> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
