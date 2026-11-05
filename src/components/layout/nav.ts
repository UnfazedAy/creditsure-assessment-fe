import { LayoutDashboard, Users, type LucideIcon } from 'lucide-react';

export const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: 'Users', icon: Users },
];
