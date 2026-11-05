import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { activityStore } from '../api/client';
import { getHealthStatus } from '../api/dashboard';
import { Spinner } from './LoadingState';

type Health = 'checking' | 'ok' | 'down';

const HEALTH_INTERVAL_MS = 60_000;

/**
 * Shows API connectivity (GET /health, on load, every 60s while the tab is visible, and on click)
 * plus live state of in-flight / failed authenticated requests.
 */
export default function ApiStatus() {
  const activity = useSyncExternalStore(activityStore.subscribe, activityStore.getSnapshot);
  const [health, setHealth] = useState<Health>('checking');

  const check = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setHealth('checking');
    try {
      const result = await getHealthStatus();
      setHealth(result.status === 'healthy' ? 'ok' : 'down');
    } catch {
      setHealth('down');
    }
  }, []);

  useEffect(() => {
    void check(true);
    const id = window.setInterval(() => {
      if (!document.hidden) void check(false);
    }, HEALTH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [check]);

  let label: string;
  let dot: React.ReactNode;
  if (health === 'checking') {
    label = 'Checking…';
    dot = <Spinner className="h-3.5 w-3.5 text-ink-500" />;
  } else if (health === 'down') {
    label = 'Unavailable';
    dot = <span className="h-2.5 w-2.5 rounded-full bg-red-600" aria-hidden="true" />;
  } else if (activity.inflight > 0) {
    label = 'Request in progress';
    dot = <Spinner className="h-3.5 w-3.5 text-brand-600" />;
  } else if (activity.lastFailed) {
    label = 'Request failed';
    dot = <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden="true" />;
  } else {
    label = 'Connected';
    dot = <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" aria-hidden="true" />;
  }

  return (
    <div role="status" aria-live="polite">
      <button
        type="button"
        onClick={() => void check(true)}
        title="API status. Click to re-check."
        className="inline-flex min-h-[2.25rem] items-center gap-2 rounded-full border border-line bg-white px-3 text-xs font-medium text-ink-700 hover:bg-surface"
      >
        {dot}
        <span>
          <span className="sr-only">API status: </span>
          {label}
        </span>
      </button>
    </div>
  );
}
