'use client';

import { useEffect, useState } from 'react';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { DocumentValidationIcon } from 'hugeicons-react';
import { getPolicies } from '@/lib/api';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPolicies().catch(() => []);
        const list = Array.isArray(data) ? data : [];
        setPolicies(list);
        setActive(list[0] || null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <PageHeader title="Policies" subtitle="Everything you need to know about shopping with us." crumbs={[{ label: 'Policies' }]} />

      <Container className="py-12">
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <Skeleton className="h-64" />
            <Skeleton className="h-96" />
          </div>
        ) : policies.length ? (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            {/* Nav */}
            <aside className="lg:sticky lg:top-24 h-max rounded-2xl border border-line bg-white p-3">
              {policies.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActive(p)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer ${
                    active?.id === p.id ? 'bg-brand-50 text-brand-700' : 'text-body hover:bg-surface-soft'
                  }`}
                >
                  <DocumentValidationIcon size={17} strokeWidth={2} />
                  {p.title || p.type || 'Policy'}
                </button>
              ))}
            </aside>

            {/* Content */}
            <article className="rounded-2xl border border-line bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-ink">{active?.title || active?.type}</h2>
              <div
                className="prose prose-sm mt-4 max-w-none text-body leading-relaxed [&_h2]:text-ink [&_h3]:text-ink [&_a]:text-brand-600"
                dangerouslySetInnerHTML={{ __html: active?.content || active?.body || '<p>No content available.</p>' }}
              />
            </article>
          </div>
        ) : (
          <EmptyState icon={DocumentValidationIcon} title="No policies published yet" message="Please check back soon." />
        )}
      </Container>
    </>
  );
}
