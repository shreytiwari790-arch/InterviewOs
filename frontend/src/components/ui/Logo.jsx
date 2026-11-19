import { cn } from '../../utils/cn';

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden="true">
      <defs>
        <linearGradient id="interviewos-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#interviewos-mark)" />
      <circle cx="16" cy="16" r="7" fill="none" stroke="#fff" strokeWidth="3" />
      <circle cx="16" cy="16" r="2" fill="#fff" />
    </svg>
  );
}

export function Logo({ tone = 'dark', className }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span
        className={cn('text-[17px] font-semibold tracking-tight', tone === 'light' ? 'text-white' : 'text-slate-900')}
      >
        Interview<span className="text-brand-600">OS</span>
      </span>
    </span>
  );
}
