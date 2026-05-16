interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color: string;
}

export function MacroRing({ label, current, target, unit = '', color }: MacroRingProps) {
  const pct = target > 0 ? Math.min(current / target, 1) : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <p className="mt-2 text-lg font-bold text-gray-900">
        {Math.round(current)}{unit}
      </p>
      <p className="text-xs text-gray-500">
        {label} / {target}{unit}
      </p>
    </div>
  );
}
