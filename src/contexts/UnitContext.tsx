import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Unit } from '@/types';

interface UnitContextValue {
  unit: Unit;
  setUnit: (unit: Unit) => void;
}

const UnitContext = createContext<UnitContextValue | null>(null);

export function UnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<Unit>(() => {
    const stored = sessionStorage.getItem('dashboard-unit');
    return (stored as Unit) || 'INR';
  });

  const setUnit = useCallback((newUnit: Unit) => {
    setUnitState(newUnit);
    sessionStorage.setItem('dashboard-unit', newUnit);
  }, []);

  return (
    <UnitContext.Provider value={{ unit, setUnit }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit(): UnitContextValue {
  const ctx = useContext(UnitContext);
  if (!ctx) throw new Error('useUnit must be used within UnitProvider');
  return ctx;
}
