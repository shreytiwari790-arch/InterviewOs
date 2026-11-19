import { Loader2 } from 'lucide-react';

export function FullPageLoader({ label = 'Loading' }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white" role="status">
      <Loader2 className="size-6 animate-spin text-brand-600" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
