import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />
      <main className="ml-14 lg:ml-56">
        {children}
      </main>
    </div>
  );
}
