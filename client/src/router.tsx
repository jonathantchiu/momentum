import { createBrowserRouter } from 'react-router-dom';
import App from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, lazy: () => import('./features/auth/LoginPage') },
      { path: 'login', lazy: () => import('./features/auth/LoginPage') },
      { path: 'register', lazy: () => import('./features/auth/RegisterPage') },
      {
        path: 'dashboard',
        lazy: () => import('./features/dashboard/DashboardPage'),
      },
    ],
  },
]);
