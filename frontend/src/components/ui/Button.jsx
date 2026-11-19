import { Loader2 } from 'lucide-react';
import { buttonClasses } from './buttonStyles';

export function Button({ variant, size, isLoading = false, disabled, type = 'button', className, children, ...props }) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
