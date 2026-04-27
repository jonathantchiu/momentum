import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/nutrition/recipes', label: 'Recipes' },
  { to: '/nutrition/meal-plan', label: 'Meal Plan' },
  { to: '/nutrition/pantry', label: 'Pantry' },
  { to: '/nutrition/shopping-list', label: 'Shopping List' },
  { to: '/nutrition/macros', label: 'Macros' },
];

export function Component() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="mb-6 border-b border-gray-200">
        <div className="-mb-px flex space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <Outlet />
    </div>
  );
}

export default Component;
