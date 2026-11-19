import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

const tones = {
  error: { icon: AlertCircle, classes: 'border-red-200 bg-red-50 text-red-800', iconClass: 'text-red-500' },
  success: {
    icon: CheckCircle2,
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    iconClass: 'text-emerald-500',
  },
  info: { icon: Info, classes: 'border-brand-200 bg-brand-50 text-brand-900', iconClass: 'text-brand-500' },
};

export function Alert({ tone = 'info', title, children, className }) {
  const { icon: Icon, classes, iconClass } = tones[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-lg border px-3.5 py-3 text-sm', classes, className)}
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', iconClass)} aria-hidden="true" />
      <div className="space-y-0.5">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="leading-relaxed opacity-90">{children}</div>}
      </div>
    </div>
  );
}
