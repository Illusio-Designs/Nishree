import { cn } from '@/lib/format';

// Small status/label pill. `tone` selects the colour treatment.
const TONES = {
  brand: 'bg-brand-600 text-white',
  soft: 'bg-brand-50 text-brand-700',
  success: 'bg-[color:var(--color-success)]/12 text-[color:var(--color-success)]',
  warning: 'bg-[color:var(--color-warning)]/15 text-[color:var(--color-warning)]',
  neutral: 'bg-surface-soft text-body',
  outline: 'bg-white text-ink border border-line',
};

export default function Badge({ children, tone = 'soft', icon: Icon, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        TONES[tone],
        className,
      )}
    >
      {Icon && <Icon size={13} strokeWidth={2} />}
      {children}
    </span>
  );
}
