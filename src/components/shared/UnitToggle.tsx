import { useUnit } from '@/contexts/UnitContext';
import type { Unit } from '@/types';

const units: Unit[] = ['INR', 'USD', 'Grams'];

export default function UnitToggle() {
  const { unit, setUnit } = useUnit();

  return (
    <div className="flex bg-gray-100 rounded-md p-0.5">
      {units.map((u) => (
        <button
          key={u}
          onClick={() => setUnit(u)}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            unit === u
              ? 'bg-white text-primary shadow-sm'
              : 'text-secondary hover:text-primary'
          }`}
        >
          {u}
        </button>
      ))}
    </div>
  );
}
