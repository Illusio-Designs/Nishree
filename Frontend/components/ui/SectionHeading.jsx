import Link from 'next/link';
import { ArrowRight01Icon } from 'hugeicons-react';
import { cn } from '@/lib/format';

// Section title with an optional "View all" link on the right.
export default function SectionHeading({ title, subtitle, actionLabel, actionHref, center, className }) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between',
        center && 'sm:flex-col sm:items-center text-center',
        className,
      )}
    >
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-body">{subtitle}</p>}
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          {actionLabel}
          <ArrowRight01Icon size={16} strokeWidth={2} />
        </Link>
      )}
    </div>
  );
}
