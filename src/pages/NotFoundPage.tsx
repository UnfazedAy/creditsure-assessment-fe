import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { status } = useAuth();
  const authed = status === 'authenticated';
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface px-4 text-center">
      <p className="text-sm font-medium text-brand-700">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-500">The page you are looking for doesn&apos;t exist or has moved.</p>
      <Link to={authed ? '/dashboard' : '/login'} className="btn-primary mt-2">
        {authed ? 'Back to dashboard' : 'Go to login'}
      </Link>
    </div>
  );
}
