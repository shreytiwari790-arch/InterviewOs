import { useId } from 'react';
import { cn } from '../../utils/cn';

/** The InterviewOS robot mark, drawn as SVG so it stays sharp at every size. */
export function LogoMark({ className }) {
  const gradientId = useId();
  return (
    <svg viewBox="389 513 384 484" className={cn('h-8 w-auto', className)} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="520" x2="0" y2="990">
          <stop offset="0" stopColor="#14C49E" />
          <stop offset="1" stopColor="#06916F" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#${gradientId})`} strokeWidth="26" strokeLinecap="round">
        <circle cx="581" cy="570" r="28.5" strokeWidth="29" />
        <path d="M581 600 V646" strokeLinecap="butt" />
        <rect x="471" y="649" width="220" height="267" rx="110" />
        <path d="M531 809 C557 842 605 842 631 809" />
        <path d="M416 764 V805 A165 165 0 0 0 746 805 V764" />
      </g>
      <g fill={`url(#${gradientId})`}>
        <circle cx="542.5" cy="743" r="20.5" />
        <circle cx="619.5" cy="743" r="20.5" />
      </g>
    </svg>
  );
}

export function Logo({ tone = 'dark', size = 'md', className }) {
  return (
    <span className={cn('inline-flex items-center', size === 'lg' ? 'gap-3' : 'gap-2', className)}>
      <LogoMark className={size === 'lg' ? 'h-10' : 'h-8'} />
      <span
        className={cn(
          'font-semibold tracking-tight lowercase',
          size === 'lg' ? 'text-2xl' : 'text-[19px]',
          tone === 'light' ? 'text-white' : 'text-ink-800',
        )}
      >
        interview <span className={tone === 'light' ? 'text-brand-300' : 'text-brand-600'}>os</span>
      </span>
    </span>
  );
}
