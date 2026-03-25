import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Wallet,
  Gift,
  Activity,
} from 'lucide-react';

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
    <aside className="fixed left-0 top-0 h-full w-14 lg:w-52 bg-white border-r border-border flex flex-col py-4 z-10">
      <div className="px-3 lg:px-4 mb-6">
        <span className="hidden lg:block text-sm font-semibold text-primary">
          gold.fi
        </span>
        <span className="block lg:hidden text-xs font-bold text-center text-primary">
          g.f
        </span>
      </div>
      <nav className="flex flex-col gap-0.5 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 lg:px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-secondary hover:text-primary hover:bg-gray-50'
              }`
            }
          >
            <item.icon size={18} className="shrink-0" />
            <span className="hidden lg:block">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
