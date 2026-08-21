import { cn } from '@/lib/format';

// Greyscale shimmer loading placeholder. Shown while an API call is in flight
// so no dummy/fallback content ever appears before real data arrives.
export default function Skeleton({ className }) {
  return <div className={cn('shimmer rounded-xl', className)} />;
}
