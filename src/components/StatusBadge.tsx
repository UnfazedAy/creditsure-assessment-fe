import type { UserRole } from '../types/api';

export function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-500" aria-hidden="true" />
      Inactive
    </span>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        role === 'admin' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-700'
      }`}
    >
      {role}
    </span>
  );
}
