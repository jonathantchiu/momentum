import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useLogin } from './useAuth';

export function Component() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card title="Sign in" className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {login.error && (
            <p className="text-sm text-red-600">
              {(login.error as { response?: { data?: { error?: string } } })?.response?.data
                ?.error ?? 'Login failed'}
            </p>
          )}
          <Button type="submit" loading={login.isPending}>
            Sign in
          </Button>
          <p className="text-center text-sm text-gray-600">
            No account?{' '}
            <Link to="/register" className="text-indigo-600 hover:underline">
              Register
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}

export default Component;
