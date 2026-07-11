import Link from 'next/link';
import { cn } from '@/lib/format';

// Official Nishree wordmark ("Flavours of India"). Transparent PNG, so it sits
// cleanly on light headers/sidebars and the dark auth panel alike.
export default function Logo({ className, compact }) {
  return (
    <Link href="/" className={cn('inline-flex items-center', className)} aria-label="Nishree — Flavours of India, home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/RTHSRT.png"
        alt="Nishree — Flavours of India"
        className={cn('w-auto object-contain', compact ? 'h-8' : 'h-10')}
      />
    </Link>
  );
}
