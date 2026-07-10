import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/format';

// Selling price with an optional struck-through compare-at price.
export default function PriceTag({ price, compareAt, size = 'md', className }) {
  const sizes = {
    sm: { now: 'text-base', was: 'text-xs' },
    md: { now: 'text-lg', was: 'text-sm' },
    lg: { now: 'text-2xl', was: 'text-base' },
  }[size];

  return (
    <span className={cn('inline-flex items-baseline gap-2', className)}>
      <span className={cn('font-bold text-brand-600', sizes.now)}>{formatPrice(price)}</span>
      {compareAt > price && (
        <span className={cn('text-muted line-through', sizes.was)}>{formatPrice(compareAt)}</span>
      )}
    </span>
  );
}
