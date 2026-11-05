import { NavLink } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS } from './nav';

export function Brand({ showText = true }: { showText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
      </span>
      {showText && (
        <span className="leading-tight">
          <span className="block text-base font-semibold">CrediSure</span>
          <span className="block text-xs text-ink-500">Administration Dashboard</span>
        </span>
      )}
    </div>
  );
}

interface NavProps {
  /** Show text labels. On the tablet rail labels are hidden until lg. */
  labels: 'always' | 'lg';
  onNavigate?: () => void;
}

export function NavList({ labels, onNavigate }: NavProps) {
  const textClass = labels === 'always' ? '' : 'hidden lg:inline';
  return (
    <nav aria-label="Main">
      <ul className="space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={onNavigate}
              title={label}
              className={({ isActive }) =>
                `flex min-h-[2.75rem] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                  labels === 'lg' ? 'justify-center lg:justify-start' : ''
                } ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-surface'}`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className={textClass}>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function UserBlock({ labels, onLogout }: { labels: 'always' | 'lg'; onLogout: () => void }) {
  const { user } = useAuth();
  const textClass = labels === 'always' ? '' : 'hidden lg:block';
  return (
    <div className="space-y-2 border-t border-line pt-4">
      {user && (
        <div className={`min-w-0 px-1 ${textClass}`}>
          <p className="truncate text-sm font-medium">{user.full_name}</p>
          <p className="truncate text-xs text-ink-500">{user.email}</p>
        </div>
      )}
      <button
        type="button"
        onClick={onLogout}
        title="Log out"
        className={`btn-secondary w-full ${labels === 'lg' ? 'px-0 lg:px-4' : ''}`}
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        <span className={labels === 'always' ? '' : 'hidden lg:inline'}>Log out</span>
        {labels === 'lg' && <span className="sr-only lg:hidden">Log out</span>}
      </button>
    </div>
  );
}

/** Persistent sidebar: icon rail on tablet (md), full sidebar on desktop (lg+). Hidden on mobile. */
export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="sticky top-0 hidden h-screen shrink-0 flex-col justify-between border-r border-line bg-white p-3 md:flex md:w-[4.5rem] lg:w-64 lg:p-4">
      <div className="space-y-6">
        <div className="flex justify-center px-1 pt-1 lg:justify-start">
          <span className="lg:hidden">
            <Brand showText={false} />
          </span>
          <span className="hidden lg:block">
            <Brand />
          </span>
        </div>
        <NavList labels="lg" />
      </div>
      <UserBlock labels="lg" onLogout={onLogout} />
    </aside>
  );
}
