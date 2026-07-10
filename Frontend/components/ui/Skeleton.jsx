import { cn } from '@/lib/format';

// Loading placeholder block.
export default function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-xl bg-surface-soft', className)} />;
}
