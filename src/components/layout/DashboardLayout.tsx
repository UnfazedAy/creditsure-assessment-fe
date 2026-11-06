import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ApiStatus from '../ApiStatus';
import MobileNav from './MobileNav';
import Sidebar, { Brand } from './Sidebar';

export default function DashboardLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the drawer when the route changes (e.g. browser back) or the viewport grows past mobile.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const onChange = (event: MediaQueryListEvent) => event.matches && setMenuOpen(false);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const handleLogout = () => {
    const loginPath = user?.role === 'admin' ? '/admin/login' : '/login';
    logout();
    navigate(loginPath, { replace: true });
  };

  return (
    <div className="min-h-screen md:flex">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <Sidebar onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-line bg-white px-4 md:hidden">
          <Brand showText={false} />
          <span className="text-base font-semibold">CrediSure</span>
          <div className="ml-auto">
            <ApiStatus />
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="btn-secondary !min-h-0 h-10 w-10 !px-0"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {/* Tablet/desktop top bar */}
        <header className="hidden h-14 items-center justify-end border-b border-line bg-white px-8 md:flex">
          <ApiStatus />
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>

      {menuOpen && <MobileNav onClose={() => setMenuOpen(false)} onLogout={handleLogout} />}
    </div>
  );
}
