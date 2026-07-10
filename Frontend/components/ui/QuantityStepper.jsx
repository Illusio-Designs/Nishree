'use client';

import { Add01Icon, Remove01Icon } from 'hugeicons-react';
import { cn } from '@/lib/format';

// −/＋ quantity control used on product and cart rows.
export default function QuantityStepper({ value, onChange, min = 1, max = 99, size = 'md', className }) {
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const btn =
    'flex items-center justify-center rounded-full text-ink hover:bg-brand-50 hover:text-brand-600 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer';

  return (
    <div className={cn('inline-flex items-center gap-1 rounded-full border border-line bg-white p-1', className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        className={cn(btn, dim)}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Remove01Icon size={16} strokeWidth={2} />
      </button>
      <span className="min-w-8 text-center text-sm font-semibold text-ink tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={cn(btn, dim)}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Add01Icon size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
