import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Wallet,
  Gift,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/portfolio', label: 'Portfolio', icon: Wallet },
  { to: '/gifts', label: 'Gifts', icon: Gift },
  { to: '/health', label: 'Health', icon: Activity },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-dvh w-14 lg:w-56 bg-background border-r border-border flex flex-col py-5 z-sidebar">
      <div className="px-3 lg:px-5 mb-8">
        <span className="hidden lg:flex items-center gap-2 text-sm font-semibold text-primary tracking-tight">
          <span className="size-1.5 rounded-full bg-accent" />
          gold.fi
        </span>
        <span className="flex lg:hidden items-center justify-center">
          <span className="size-1.5 rounded-full bg-accent" />
        </span>
      </div>
      <nav className="flex flex-col gap-0.5 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-2.5 lg:px-3 py-2 rounded-md text-[13px] font-medium',
                isActive
                  ? 'relative before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-full before:bg-accent bg-accent-muted text-accent'
                  : 'text-tertiary hover:text-secondary hover:bg-white/[0.03]'
              )
            }
          >
            <item.icon size={17} className="shrink-0" />
            <span className="hidden lg:block">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
