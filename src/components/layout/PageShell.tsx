import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-14 lg:ml-52">
        {children}
      </main>
    </div>
  );
}
