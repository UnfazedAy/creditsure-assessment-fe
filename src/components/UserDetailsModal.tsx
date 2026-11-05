import { useEffect, useState } from 'react';
import { getUserById } from '../api/users';
import { toApiError, type ApiError } from '../api/client';
import type { User } from '../types/api';
import { formatDateTime } from '../utils';
import ErrorState from './ErrorState';
import { Skeleton } from './LoadingState';
import Modal from './Modal';
import { RoleBadge, StatusBadge } from './StatusBadge';

interface Props {
  userId: string;
  onClose: () => void;
}

export default function UserDetailsModal({ userId, onClose }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setUser(null);
    setError(null);
    getUserById(userId, controller.signal)
      .then(setUser)
      .catch((e: unknown) => {
        const apiError = toApiError(e);
        if (apiError.kind !== 'canceled') setError(apiError);
      });
    return () => controller.abort();
  }, [userId, attempt]);

  const rows: [string, React.ReactNode][] = user
    ? [
        ['Full name', user.full_name],
        ['Email', <span className="break-all">{user.email}</span>],
        ['Role', <RoleBadge role={user.role} />],
        ['Status', <StatusBadge active={user.is_active} />],
        ['Created', formatDateTime(user.created_at)],
        ['User ID', <code className="break-all text-xs">{user.id}</code>],
      ]
    : [];

  return (
    <Modal title="User details" onClose={onClose}>
      {error ? (
        <ErrorState error={error} onRetry={() => setAttempt((a) => a + 1)} />
      ) : !user ? (
        <div className="space-y-3" role="status" aria-label="Loading user details">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      ) : (
        <dl className="space-y-3 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-3 items-center gap-2">
              <dt className="text-ink-500">{label}</dt>
              <dd className="col-span-2">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Modal>
  );
}
