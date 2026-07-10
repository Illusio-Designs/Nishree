'use client';

import { useEffect } from 'react';
import { Cancel01Icon } from 'hugeicons-react';
import { cn } from '@/lib/format';

// Centered modal for admin create/edit forms and confirmations.
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const width = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }[size];

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className={cn('relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-pop sm:rounded-3xl', width)}>
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-soft cursor-pointer">
            <Cancel01Icon size={20} strokeWidth={2} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="border-t border-line px-6 py-4">{footer}</footer>}
      </div>
    </div>
  );
}
