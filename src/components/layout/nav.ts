import { CircleUserRound, LayoutDashboard, Users, type LucideIcon } from 'lucide-react';

export const ADMIN_NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/profile', label: 'My Profile', icon: CircleUserRound },
];

export const USER_NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/my-dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'My Profile', icon: CircleUserRound },
];
