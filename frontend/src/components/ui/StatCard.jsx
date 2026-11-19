import { Skeleton } from './Skeleton';

export function StatCard({ label, value, hint, icon: Icon, isLoading }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && <Icon className="size-4 text-slate-400" aria-hidden="true" />}
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <p className="mt-2 text-[28px] leading-tight font-semibold tracking-tight text-ink-900 tabular-nums">{value}</p>
      )}
      {hint && <p className="mt-1 truncate text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
