import { cn } from '../../utils/cn';

/** Rounded white surface used across candidate pages, with an optional icon, title and header action. */
export function Panel({ icon: Icon, title, description, action, className, bodyClassName, children }) {
  return (
    <section
      className={cn(
        'rounded-3xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
        className,
      )}
    >
      {title && (
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                <Icon className="size-[18px] text-brand-600" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="font-semibold text-ink-900">{title}</h2>
              {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn('px-6 pt-5 pb-6', bodyClassName)}>{children}</div>
    </section>
  );
}
