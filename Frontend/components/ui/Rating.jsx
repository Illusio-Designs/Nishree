import { StarIcon } from 'hugeicons-react';
import { cn } from '@/lib/format';

// Star rating display (read-only). Renders filled/empty stars in brand accent.
export default function Rating({ value = 0, count, size = 15, className }) {
  const rounded = Math.round(Number(value) || 0);
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon
            key={i}
            size={size}
            strokeWidth={2}
            className={i <= rounded ? 'text-[#f5a623]' : 'text-line'}
            style={i <= rounded ? { fill: '#f5a623' } : undefined}
          />
        ))}
      </span>
      {count != null && <span className="text-xs text-muted">({count})</span>}
    </span>
  );
}
