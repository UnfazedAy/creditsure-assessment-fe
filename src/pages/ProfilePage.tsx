import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { getCurrentUser } from '../api/auth';
import { toApiError, type ApiError } from '../api/client';
import ErrorState from '../components/ErrorState';
import { FullScreenLoader } from '../components/LoadingState';
import { RoleBadge, StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/api';
import { formatDate } from '../utils';

export default function ProfilePage() {
  const { user: authenticatedUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getCurrentUser(controller.signal)
      .then((currentUser) => {
        setProfile(currentUser);
        setLoading(false);
      })
      .catch((cause: unknown) => {
        const apiError = toApiError(cause);
        if (apiError.kind === 'canceled') return;
        setError(apiError);
        setLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  if (loading) return <FullScreenLoader label="Loading your profile…" />;

  const backToDashboard = () => {
    navigate(authenticatedUser?.role === 'admin' ? '/dashboard' : '/my-dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Profile</h1>
          <p className="mt-1 text-sm text-ink-500">Your account information from CrediSure.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={backToDashboard}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Dashboard
        </button>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : profile ? (
        <section aria-labelledby="profile-details-title" className="card p-5 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <UserRound className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="profile-details-title" className="text-lg font-semibold">{profile.full_name}</h2>
              <p className="break-all text-sm text-ink-500">{profile.email}</p>
            </div>
          </div>

          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Email</dt>
                <dd className="mt-1 break-all text-sm text-ink-900">{profile.email}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Role</dt>
                <dd className="mt-1"><RoleBadge role={profile.role} /></dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Account status</dt>
                <dd className="mt-1"><StatusBadge active={profile.is_active} /></dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Date joined</dt>
                <dd className="mt-1 text-sm text-ink-900">{formatDate(profile.created_at)}</dd>
              </div>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">User ID</dt>
              <dd className="mt-1 break-all font-mono text-sm text-ink-700">{profile.id}</dd>
            </div>
          </dl>
          <p className="mt-5 text-xs text-ink-500">Profile details are read-only; self-service editing is not available.</p>
        </section>
      ) : (
        <div role="alert" className="card p-5 text-sm text-ink-600">
          Profile information is unavailable.{' '}
          <button type="button" className="font-medium text-brand-700 underline" onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
