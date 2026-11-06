import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils';

export default function MyDashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user.full_name}</h1>
        <p className="mt-1 text-sm text-ink-500">Your CrediSure account at a glance.</p>
      </div>

      <section aria-labelledby="account-summary-title" className="card p-5 sm:p-6">
        <h2 id="account-summary-title" className="text-base font-semibold">Account summary</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Email</dt>
              <dd className="mt-1 break-all text-sm text-ink-900">{user.email}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Role</dt>
              <dd className="mt-1 text-sm capitalize text-ink-900">{user.role}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Account status</dt>
              <dd className="mt-1"><StatusBadge active={user.is_active} /></dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Date joined</dt>
              <dd className="mt-1 text-sm text-ink-900">{formatDate(user.created_at)}</dd>
            </div>
          </div>
        </dl>
        <Link to="/profile" className="btn-secondary mt-6">
          View my profile
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
