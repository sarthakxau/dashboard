import { useUnit } from '@/contexts/UnitContext';
import { cn } from '@/lib/cn';
import type { Unit } from '@/types';

const units: Unit[] = ['INR', 'USD', 'Grams'];

export default function UnitToggle() {
  const { unit, setUnit } = useUnit();

  return (
    <div className="flex bg-black/20 rounded-md p-0.5 border border-white/[0.08]">
      {units.map((u) => (
        <button
          key={u}
          onClick={() => setUnit(u)}
          className={cn(
            'px-2.5 py-1 text-xs font-medium rounded-[5px]',
            unit === u
              ? 'bg-accent-muted text-accent'
              : 'text-tertiary hover:text-secondary'
          )}
        >
          {u}
        </button>
      ))}
    </div>
  );
}
