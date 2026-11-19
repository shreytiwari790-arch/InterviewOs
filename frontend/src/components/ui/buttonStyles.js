import { cn } from '../../utils/cn';

const variantClasses = {
  primary: 'bg-brand-600 text-white shadow-sm shadow-brand-700/20 hover:bg-brand-700 focus-visible:outline-brand-600',
  dark: 'bg-ink-900 text-white shadow-sm hover:bg-ink-800 focus-visible:outline-ink-900',
  secondary:
    'border border-slate-200 bg-white text-ink-800 shadow-xs hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400',
  ghost: 'text-ink-600 hover:bg-slate-100 hover:text-ink-900 focus-visible:outline-slate-400',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:outline-red-600',
};

const sizeClasses = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-[15px]',
};

export function buttonClasses({ variant = 'primary', size = 'md', className } = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200',
    'focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}
