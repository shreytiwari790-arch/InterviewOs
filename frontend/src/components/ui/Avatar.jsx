import { cn } from '../../utils/cn';
import { initials } from '../../utils/format';

export function Avatar({ name, className }) {
  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-xs font-semibold text-white',
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
