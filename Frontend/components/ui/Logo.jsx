import Link from 'next/link';
import { Leaf01Icon } from 'hugeicons-react';
import { cn } from '@/lib/format';

// Nishree wordmark with a rounded leaf glyph in brand red.
export default function Logo({ className, compact }) {
  return (
    <Link href="/" className={cn('inline-flex items-center gap-2', className)} aria-label="Nishree home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-soft">
        <Leaf01Icon size={20} strokeWidth={2} />
      </span>
      {!compact && (
        <span className="text-xl font-extrabold tracking-tight text-ink">
          Nish<span className="text-brand-600">ree</span>
        </span>
      )}
    </Link>
  );
}
