import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import type { ApiError } from '../api/client';

interface Props {
  error: ApiError;
  onRetry?: () => void;
}

export default function ErrorState({ error, onRetry }: Props) {
  const denied = error.status === 403;
  const Icon = denied ? ShieldAlert : AlertTriangle;
  return (
    <div role="alert" className="card flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-700">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="text-base font-semibold">{denied ? 'Access denied' : 'Something went wrong'}</h2>
      <p className="max-w-md text-sm text-ink-500">{error.message}</p>
      {onRetry && (
        <button type="button" className="btn-secondary mt-1" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
