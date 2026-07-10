import { cn } from '@/lib/format';

// Colour-coded status label used in admin tables.
const MAP = {
  active: 'bg-[color:var(--color-success)]/12 text-[color:var(--color-success)]',
  completed: 'bg-[color:var(--color-success)]/12 text-[color:var(--color-success)]',
  delivered: 'bg-[color:var(--color-success)]/12 text-[color:var(--color-success)]',
  approved: 'bg-[color:var(--color-success)]/12 text-[color:var(--color-success)]',
  paid: 'bg-[color:var(--color-success)]/12 text-[color:var(--color-success)]',
  pending: 'bg-[color:var(--color-warning)]/15 text-[color:var(--color-warning)]',
  processing: 'bg-brand-50 text-brand-700',
  shipped: 'bg-brand-50 text-brand-700',
  inactive: 'bg-surface-soft text-body',
  cancelled: 'bg-red-100 text-danger',
  rejected: 'bg-red-100 text-danger',
  failed: 'bg-red-100 text-danger',
};

export default function StatusPill({ status }) {
  const key = String(status || '').toLowerCase();
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize', MAP[key] || 'bg-surface-soft text-body')}>
      {status || '—'}
    </span>
  );
}
