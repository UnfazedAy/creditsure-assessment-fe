import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, UserCheck, UserPlus, Users, UserX } from 'lucide-react';
import { getDashboardOverview } from '../api/dashboard';
import { toApiError, type ApiError } from '../api/client';
import ErrorState from '../components/ErrorState';
import { Spinner } from '../components/LoadingState';
import StatCard from '../components/StatCard';
import type { DashboardOverview } from '../types/api';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getDashboardOverview(controller.signal)
      .then((overview) => {
        setData(overview);
        setLoading(false);
      })
      .catch((e: unknown) => {
        const apiError = toApiError(e);
        if (apiError.kind === 'canceled') return;
        setError(apiError);
        setLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-ink-500">A snapshot of registered users and account activity.</p>
        </div>
        <button type="button" onClick={refresh} disabled={loading} className="btn-secondary">
          {loading ? <Spinner /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
          Refresh
        </button>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refresh} />
      ) : (
        <section aria-label="User statistics" aria-busy={loading} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Users" value={data?.total_users} icon={Users} tone="brand" loading={loading && !data} />
          <StatCard label="Active Users" value={data?.active_users} icon={UserCheck} tone="teal" loading={loading && !data} />
          <StatCard label="Inactive Users" value={data?.inactive_users} icon={UserX} tone="slate" loading={loading && !data} />
          <StatCard label="New Users This Month" value={data?.new_users_this_month} icon={UserPlus} tone="brand" loading={loading && !data} />
        </section>
      )}
    </div>
  );
}
