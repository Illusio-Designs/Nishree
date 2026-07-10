'use client';

import { useEffect } from 'react';
import { Cancel01Icon } from 'hugeicons-react';
import { cn } from '@/lib/format';

// Slide-in panel used for the cart and mobile navigation. Portal-free: rendered
// as a fixed overlay. `side` controls which edge it slides from.
export default function Drawer({ open, onClose, title, side = 'right', children, widthClass = 'max-w-sm' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div
      className={cn('fixed inset-0 z-[60] transition-opacity duration-300', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
      aria-hidden={!open}
    >
      {/* Scrim */}
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />

      {/* Panel */}
      <aside
        className={cn(
          'absolute top-0 bottom-0 flex w-full flex-col bg-white shadow-pop transition-transform duration-300',
          widthClass,
          side === 'right' ? 'right-0' : 'left-0',
          open ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-surface-soft cursor-pointer"
          >
            <Cancel01Icon size={20} strokeWidth={2} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>
  );
}
