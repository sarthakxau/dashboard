import { createContext, useContext, type ReactNode } from 'react';
const UnitContext = createContext<{ unit: string; setUnit: (u: string) => void }>({ unit: 'INR', setUnit: () => {} });
export function UnitProvider({ children }: { children: ReactNode }) { return <UnitContext.Provider value={{ unit: 'INR', setUnit: () => {} }}>{children}</UnitContext.Provider>; }
export function useUnit() { return useContext(UnitContext); }
