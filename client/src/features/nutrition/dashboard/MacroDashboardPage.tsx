import { Card } from '../../../components/ui/Card';
import { MacroRing } from './MacroRing';
import { useNutritionTargets } from './useMacros';

export function Component() {
  const { data: targets } = useNutritionTargets();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Macro Dashboard</h1>

      <Card title="Daily Progress">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <MacroRing label="Calories" current={0} target={targets?.calories ?? 2000} color="#6366f1" />
          <MacroRing label="Protein" current={0} target={targets?.proteinG ?? 150} unit="g" color="#3b82f6" />
          <MacroRing label="Carbs" current={0} target={targets?.carbsG ?? 250} unit="g" color="#f59e0b" />
          <MacroRing label="Fat" current={0} target={targets?.fatG ?? 65} unit="g" color="#ef4444" />
        </div>
        <p className="mt-4 text-center text-sm text-gray-400">
          Log meals via the Meal Plan to see daily totals here.
        </p>
      </Card>

      <Card title="Targets">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <span className="text-gray-500">Calories:</span>{' '}
            <span className="font-medium">{targets?.calories ?? 2000}</span>
          </div>
          <div>
            <span className="text-gray-500">Protein:</span>{' '}
            <span className="font-medium">{targets?.proteinG ?? 150}g</span>
          </div>
          <div>
            <span className="text-gray-500">Carbs:</span>{' '}
            <span className="font-medium">{targets?.carbsG ?? 250}g</span>
          </div>
          <div>
            <span className="text-gray-500">Fat:</span>{' '}
            <span className="font-medium">{targets?.fatG ?? 65}g</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Component;
