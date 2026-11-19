import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

/** Modal built on the native <dialog> element (focus trapping and Escape handling come for free). */
export function Dialog({ isOpen, onClose, title, description, size = 'md', children, footer }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      className={cn(
        'm-auto max-h-[90dvh] w-[min(94vw,var(--dialog-width))] overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-ink-900/40 backdrop:backdrop-blur-[2px]',
        size === 'lg' ? '[--dialog-width:760px]' : '[--dialog-width:520px]',
      )}
    >
      {isOpen && (
        <div className="flex max-h-[90dvh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
              {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-ink-500 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
