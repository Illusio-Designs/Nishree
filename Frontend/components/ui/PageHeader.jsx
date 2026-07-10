import Link from 'next/link';
import { ArrowRight01Icon } from 'hugeicons-react';
import Container from '@/components/ui/Container';

// Inner-page banner: soft brand wash, title, and breadcrumbs.
export default function PageHeader({ title, subtitle, crumbs = [] }) {
  return (
    <div className="border-b border-line bg-surface-tint">
      <Container className="py-10 sm:py-12">
        <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm text-muted">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1">
              <ArrowRight01Icon size={14} strokeWidth={2} />
              {c.href ? (
                <Link href={c.href} className="hover:text-brand-600">{c.label}</Link>
              ) : (
                <span className="text-ink">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-body">{subtitle}</p>}
      </Container>
    </div>
  );
}
