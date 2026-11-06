import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/api';
import { FullScreenLoader } from './LoadingState';

interface Props {
  allowedRoles?: UserRole[];
  loginPath?: string;
}

export default function ProtectedRoute({ allowedRoles, loginPath = '/login' }: Props) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullScreenLoader label="Checking your session…" />;
  if (status === 'unauthenticated') return <Navigate to={loginPath} replace state={{ from: location }} />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/my-dashboard'} replace />;
  }
  return <Outlet />;
}
