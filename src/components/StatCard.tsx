import type { LucideIcon } from 'lucide-react';
import { Skeleton } from './LoadingState';

interface Props {
  label: string;
  value?: number;
  icon: LucideIcon;
  tone: 'brand' | 'teal' | 'slate';
  loading?: boolean;
}

const TONES = {
  brand: 'bg-brand-50 text-brand-700',
  teal: 'bg-teal-50 text-teal-700',
  slate: 'bg-slate-100 text-slate-700',
} as const;

export default function StatCard({ label, value, icon: Icon, tone, loading }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${TONES[tone]}`}>
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-4 h-9 w-20" />
      ) : (
        <p className="mt-3 text-3xl font-semibold tabular-nums">{(value ?? 0).toLocaleString()}</p>
      )}
    </div>
  );
}
