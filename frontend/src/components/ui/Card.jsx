import { cn } from '../../utils/cn';

export function Card({ className, children }) {
  return (
    <section className={cn('rounded-xl border border-slate-200/80 bg-white shadow-xs', className)}>{children}</section>
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-5 pt-5 sm:px-6', className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('px-5 pt-4 pb-5 sm:px-6', className)}>{children}</div>;
}
