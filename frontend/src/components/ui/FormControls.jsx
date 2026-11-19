import { useId, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

const fieldClasses = (error) =>
  cn(
    'w-full rounded-xl border bg-white px-3.5 text-sm text-ink-900 shadow-xs transition placeholder:text-slate-400 focus:ring-4 focus:outline-none',
    error
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-100',
  );

export function FieldShell({ label, hint, error, htmlFor, children, className }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      {children}
      {(error || hint) && (
        <p className={cn('mt-1.5 text-xs', error ? 'text-red-600' : 'text-ink-500')}>{error || hint}</p>
      )}
    </div>
  );
}

export function TextAreaField({ label, hint, error, className, rows = 4, ...props }) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id} className={className}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(fieldClasses(error), 'resize-y py-3')}
        {...props}
      />
    </FieldShell>
  );
}

export function NumberField({ label, hint, error, className, ...props }) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id} className={className}>
      <input
        id={id}
        type="number"
        aria-invalid={Boolean(error)}
        className={cn(fieldClasses(error), 'h-11 tabular-nums')}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({ label, hint, error, options, className, ...props }) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id} className={className}>
      <select
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(fieldClasses(error), 'h-11 appearance-none pr-9')}
        {...props}
      >
        {options.map(({ value, label: optionLabel }) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-ink-800">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-ink-500">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-brand-500' : 'bg-slate-300',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </label>
  );
}

/** Free-text tags: type and press Enter or comma to add. */
export function TagInput({ label, hint, error, values, onChange, placeholder = 'Type and press Enter' }) {
  const id = useId();
  const [draft, setDraft] = useState('');

  function commit() {
    const value = draft.trim();
    if (value && !values.includes(value)) onChange([...values, value]);
    setDraft('');
  }

  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id}>
      <div className={cn(fieldClasses(error), 'flex min-h-11 flex-wrap items-center gap-1.5 px-2 py-1.5')}>
        {values.map((value) => (
          <span
            key={value}
            className="flex items-center gap-1 rounded-full bg-brand-50 py-1 pr-1 pl-3 text-xs font-medium text-brand-800"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((item) => item !== value))}
              className="rounded-full p-0.5 hover:bg-brand-100"
              aria-label={`Remove ${value}`}
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              commit();
            } else if (event.key === 'Backspace' && !draft && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={commit}
          placeholder={values.length ? '' : placeholder}
          className="h-7 min-w-32 flex-1 bg-transparent px-1.5 text-sm outline-none"
        />
      </div>
    </FieldShell>
  );
}
