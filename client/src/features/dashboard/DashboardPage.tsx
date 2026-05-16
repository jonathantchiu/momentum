import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useLogout } from '../auth/useAuth';

export function Component() {
  const logout = useLogout();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Health OS</h1>
        <Button variant="ghost" onClick={() => logout.mutate()}>Sign out</Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/nutrition/recipes">
          <Card className="transition hover:shadow-md">
            <h3 className="font-semibold text-gray-900">Recipes</h3>
            <p className="mt-1 text-sm text-gray-500">Browse and manage your recipes</p>
          </Card>
        </Link>
        <Link to="/nutrition/meal-plan">
          <Card className="transition hover:shadow-md">
            <h3 className="font-semibold text-gray-900">Meal Plan</h3>
            <p className="mt-1 text-sm text-gray-500">Plan your weekly meals</p>
          </Card>
        </Link>
        <Link to="/nutrition/pantry">
          <Card className="transition hover:shadow-md">
            <h3 className="font-semibold text-gray-900">Pantry</h3>
            <p className="mt-1 text-sm text-gray-500">Track what you have on hand</p>
          </Card>
        </Link>
        <Link to="/nutrition/shopping-list">
          <Card className="transition hover:shadow-md">
            <h3 className="font-semibold text-gray-900">Shopping List</h3>
            <p className="mt-1 text-sm text-gray-500">Auto-generated from meal plan</p>
          </Card>
        </Link>
        <Link to="/nutrition/macros">
          <Card className="transition hover:shadow-md">
            <h3 className="font-semibold text-gray-900">Macros</h3>
            <p className="mt-1 text-sm text-gray-500">Track daily nutrition targets</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default Component;
