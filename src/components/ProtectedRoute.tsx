import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullScreenLoader } from './LoadingState';

export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullScreenLoader label="Checking your session…" />;
  if (status === 'unauthenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
