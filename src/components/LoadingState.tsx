import { Loader2 } from 'lucide-react';

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />;
}

export function FullScreenLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface" role="status">
      <div className="flex items-center gap-3 text-ink-500">
        <Spinner className="h-5 w-5" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-line/70 ${className}`} aria-hidden="true" />;
}
