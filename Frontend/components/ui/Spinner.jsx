import { cn } from '@/lib/format';

// Brand loading spinner.
export default function Spinner({ className, size = 24 }) {
  return (
    <span
      className={cn('inline-block animate-spin rounded-full border-2 border-brand-100 border-t-brand-600', className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
