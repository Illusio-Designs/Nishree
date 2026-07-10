'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock01Icon, ArrowLeft01Icon } from 'hugeicons-react';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { getBlog, mediaUrl } from '@/lib/api';

export default function RecipeArticle({ slug }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlog(slug)
      .then((p) => setPost(p))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>;
  if (!post) {
    return (
      <Container className="py-16">
        <EmptyState title="Post not found" action={<Button href="/recipes">Back to Recipes</Button>} />
      </Container>
    );
  }

  const img = mediaUrl(post.image);

  return (
    <article className="pb-16">
      <div className="border-b border-line bg-surface-tint">
        <Container className="py-10">
          <Link href="/recipes" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
            <ArrowLeft01Icon size={16} strokeWidth={2} /> All recipes
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            {post.category && <Badge tone="brand">{post.category}</Badge>}
            {post.read_time && (
              <span className="inline-flex items-center gap-1 text-sm text-muted">
                <Clock01Icon size={14} strokeWidth={2} /> {post.read_time}
              </span>
            )}
            {post.author && <span className="text-sm text-muted">· {post.author}</span>}
          </div>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold text-ink sm:text-4xl">{post.title}</h1>
          {post.excerpt && <p className="mt-3 max-w-2xl text-lg text-body">{post.excerpt}</p>}
        </Container>
      </div>

      <Container className="pt-8">
        {img && (
          <div className="mb-8 overflow-hidden rounded-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={post.title} className="max-h-[420px] w-full object-cover" />
          </div>
        )}
        <div
          className="prose prose-sm mx-auto max-w-3xl text-body leading-relaxed [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-ink [&_li]:my-1 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_p]:my-3"
          dangerouslySetInnerHTML={{ __html: post.content || '<p>Full recipe coming soon.</p>' }}
        />
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-line bg-surface-soft p-6 text-center">
          <p className="font-semibold text-ink">Cook this with fresh Nishree spices</p>
          <Button href="/products" className="mt-3">Shop Spices</Button>
        </div>
      </Container>
    </article>
  );
}
