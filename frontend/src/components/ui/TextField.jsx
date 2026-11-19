import { useId } from 'react';
import { cn } from '../../utils/cn';

export function TextField({ label, labelAction, error, hint, icon: Icon, trailing, id, className, ...inputProps }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error || hint;

  return (
    <div className={className}>
      {(label || labelAction) && (
        <div className="mb-1.5 flex items-center justify-between gap-4">
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
          {labelAction}
        </div>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={message ? messageId : undefined}
          className={cn(
            'h-11 w-full rounded-[10px] border bg-white px-3.5 text-sm text-slate-900 shadow-xs transition-[border-color,box-shadow] duration-150',
            'placeholder:text-slate-400 focus:ring-4 focus:outline-none',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-100',
            Icon && 'pl-10',
            trailing && 'pr-10',
          )}
          {...inputProps}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center pr-1">{trailing}</div>}
      </div>

      {message && (
        <p id={messageId} className={cn('mt-1.5 text-xs', error ? 'text-red-600' : 'text-slate-500')}>
          {message}
        </p>
      )}
    </div>
  );
}
