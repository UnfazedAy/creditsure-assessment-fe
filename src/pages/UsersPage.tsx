import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, SearchX, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { toApiError, type ApiError } from '../api/client';
import { getUsers, updateUserStatus } from '../api/users';
import ErrorState from '../components/ErrorState';
import { Skeleton, Spinner } from '../components/LoadingState';
import Modal from '../components/Modal';
import { RoleBadge, StatusBadge } from '../components/StatusBadge';
import UserDetailsModal from '../components/UserDetailsModal';
import { useAuth } from '../context/AuthContext';
import type { PaginatedUsers, User, UserRole } from '../types/api';
import { formatDate } from '../utils';

const PAGE_SIZES = [5, 10, 20];
const DEFAULT_LIMIT = 10;
type StatusFilter = 'all' | 'active' | 'inactive';
type RoleFilter = 'all' | UserRole;

const positiveInt = (value: string | null, fallback: number) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : fallback;
};

export default function UsersPage() {
  const { user: me } = useAuth();
  const [params, setParams] = useSearchParams();

  // Filter state lives in the URL so it survives refreshes and back/forward navigation.
  const page = positiveInt(params.get('page'), 1);
  const requestedLimit = positiveInt(params.get('limit'), DEFAULT_LIMIT);
  const limit = PAGE_SIZES.includes(requestedLimit) ? requestedLimit : DEFAULT_LIMIT;
  const search = (params.get('search') ?? '').slice(0, 100);
  const statusParam = params.get('status');
  const status: StatusFilter = statusParam === 'active' || statusParam === 'inactive' ? statusParam : 'all';
  const roleParam = params.get('role');
  const role: RoleFilter = roleParam === 'admin' || roleParam === 'user' ? roleParam : 'all';

  const updateParams = useCallback(
    (changes: Record<string, string | null>, opts: { keepPage?: boolean; replace?: boolean } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(changes)) {
            if (value === null || value === '') next.delete(key);
            else next.set(key, value);
          }
          if (!opts.keepPage && !('page' in changes)) next.delete('page');
          return next;
        },
        { replace: opts.replace },
      );
    },
    [setParams],
  );

  /* ----- debounced search ----- */
  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => setSearchInput(search), [search]);
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === search) return;
    const id = window.setTimeout(() => updateParams({ search: trimmed || null }, { replace: true }), 400);
    return () => window.clearTimeout(id);
  }, [searchInput, search, updateParams]);

  /* ----- data loading (server-side search, filters and pagination) ----- */
  const [result, setResult] = useState<PaginatedUsers | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getUsers(
      {
        page,
        limit,
        search: search || undefined,
        is_active: status === 'all' ? undefined : status === 'active',
        role: role === 'all' ? undefined : role,
      },
      controller.signal,
    )
      .then((data) => {
        if (data.total_pages > 0 && page > data.total_pages) {
          updateParams({ page: String(data.total_pages) }, { replace: true });
          return;
        }
        setResult(data);
        setLoading(false);
      })
      .catch((e: unknown) => {
        const apiError = toApiError(e);
        if (apiError.kind === 'canceled') return;
        setError(apiError);
        setLoading(false);
      });
    return () => controller.abort();
  }, [page, limit, search, status, role, reloadKey, updateParams]);

  /* ----- details + status change ----- */
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [pending, setPending] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const closeConfirm = () => {
    if (saving) return;
    setPending(null);
    setActionError(null);
  };

  const confirmToggle = async () => {
    if (!pending) return;
    setSaving(true);
    setActionError(null);
    try {
      const updated = await updateUserStatus(pending.id, !pending.is_active);
      toast.success(`${updated.full_name} is now ${updated.is_active ? 'active' : 'inactive'}.`);
      setPending(null);
      setReloadKey((k) => k + 1);
    } catch (e) {
      setActionError(toApiError(e).message);
    } finally {
      setSaving(false);
    }
  };

  const filtersActive = Boolean(search) || status !== 'all' || role !== 'all';
  const clearFilters = () => {
    setSearchInput('');
    updateParams({ search: null, status: null, role: null });
  };

  const items = result?.items ?? [];
  const firstRow = result && result.total > 0 ? (result.page - 1) * result.limit + 1 : 0;
  const lastRow = firstRow > 0 ? firstRow + items.length - 1 : 0;
  const isSelf = (u: User) => me?.id.toLowerCase() === u.id.toLowerCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="mt-1 text-sm text-ink-500">Search, filter and manage account status for every registered user.</p>
      </div>

      {/* Filters */}
      <div className="card flex flex-col gap-3 p-4 md:flex-row md:items-end">
        <div className="md:flex-1">
          <label htmlFor="user-search" className="label">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input
              id="user-search"
              type="search"
              maxLength={100}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search users by name or email..."
              className="input pl-9 pr-10 [&::-webkit-search-cancel-button]:hidden"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateParams({ search: null }, { replace: true });
                }}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink-500 hover:text-ink-900"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:flex">
          <div>
            <label htmlFor="status-filter" className="label">
              Status
            </label>
            <select
              id="status-filter"
              className="input"
              value={status}
              onChange={(e) => updateParams({ status: e.target.value === 'all' ? null : e.target.value })}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label htmlFor="role-filter" className="label">
              Role
            </label>
            <select
              id="role-filter"
              className="input"
              value={role}
              onChange={(e) => updateParams({ role: e.target.value === 'all' ? null : e.target.value })}
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
        {filtersActive && (
          <button type="button" onClick={clearFilters} className="btn-secondary">
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {error && !result ? (
        <ErrorState error={error} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : (
        <div className="card overflow-hidden" aria-busy={loading}>
          {error && (
            <div role="alert" className="flex items-center justify-between gap-3 bg-red-50 px-4 py-2.5 text-sm text-red-800">
              <span>{error.message}</span>
              <button type="button" className="font-medium underline" onClick={() => setReloadKey((k) => k + 1)}>
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <caption className="sr-only">Registered users</caption>
              <thead className="border-b border-line bg-surface text-xs text-ink-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Full name</th>
                  <th scope="col" className="px-4 py-3 font-medium">Email</th>
                  <th scope="col" className="px-4 py-3 font-medium">Role</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Created</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-line ${loading && result ? 'opacity-60' : ''}`}>
                {loading && !result
                  ? Array.from({ length: limit }, (_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }, (_, j) => (
                          <td key={j} className="px-4 py-3.5">
                            <Skeleton className="h-5 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : items.map((u) => {
                      const self = isSelf(u);
                      return (
                        <tr key={u.id} className="hover:bg-surface/60">
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => setDetailsId(u.id)}
                              className="rounded text-left font-medium text-brand-700 hover:underline"
                            >
                              {u.full_name}
                            </button>
                            {self && <span className="ml-2 text-xs text-ink-500">(you)</span>}
                          </td>
                          <td className="px-4 py-3 text-ink-700">{u.email}</td>
                          <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                          <td className="px-4 py-3"><StatusBadge active={u.is_active} /></td>
                          <td className="whitespace-nowrap px-4 py-3 text-ink-700">{formatDate(u.created_at)}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button type="button" className="btn-secondary !min-h-[2.25rem] !px-3" onClick={() => setDetailsId(u.id)}>
                                View
                              </button>
                              <button
                                type="button"
                                className="btn-secondary !min-h-[2.25rem] !px-3"
                                disabled={u.is_active && self}
                                title={u.is_active && self ? "You can't deactivate your own account" : undefined}
                                onClick={() => setPending(u)}
                              >
                                {u.is_active ? 'Deactivate' : 'Activate'}
                                <span className="sr-only"> {u.full_name}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {!loading && result && items.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <SearchX className="h-8 w-8 text-ink-400" aria-hidden="true" />
              <p className="font-medium">No users found</p>
              <p className="text-sm text-ink-500">
                {filtersActive ? 'No users match your search or filters.' : 'There are no users to show yet.'}
              </p>
              {filtersActive && (
                <button type="button" className="btn-secondary mt-2" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {result && (
            <div className="flex flex-col gap-3 border-t border-line px-4 py-3 text-sm text-ink-700 md:flex-row md:items-center md:justify-between">
              <p aria-live="polite">
                {result.total > 0 ? `Showing ${firstRow}–${lastRow} of ${result.total.toLocaleString()} users` : '0 users'}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label htmlFor="page-size" className="text-ink-500">Rows per page</label>
                  <select
                    id="page-size"
                    className="input !w-auto"
                    value={limit}
                    onChange={(e) => updateParams({ limit: e.target.value === String(DEFAULT_LIMIT) ? null : e.target.value })}
                  >
                    {PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <span>
                  Page {result.total_pages === 0 ? 0 : result.page} of {result.total_pages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={!result.has_previous || loading}
                    onClick={() => updateParams({ page: result.page - 1 <= 1 ? null : String(result.page - 1) })}
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={!result.has_next || loading}
                    onClick={() => updateParams({ page: String(result.page + 1) })}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {detailsId && <UserDetailsModal userId={detailsId} onClose={() => setDetailsId(null)} />}

      {pending && (
        <Modal
          title={pending.is_active ? 'Deactivate account?' : 'Activate account?'}
          onClose={closeConfirm}
          footer={
            <>
              <button type="button" className="btn-secondary" onClick={closeConfirm} disabled={saving}>
                Cancel
              </button>
              <button
                type="button"
                className={pending.is_active ? 'btn-danger' : 'btn-primary'}
                onClick={() => void confirmToggle()}
                disabled={saving}
              >
                {saving && <Spinner />}
                {pending.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </>
          }
        >
          <p className="text-sm text-ink-700">
            {pending.is_active
              ? `${pending.full_name} (${pending.email}) will no longer be able to use their account.`
              : `${pending.full_name} (${pending.email}) will regain access to their account.`}
          </p>
          {actionError && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              {actionError}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
