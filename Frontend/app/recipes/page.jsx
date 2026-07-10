'use client';

import { useEffect, useState } from 'react';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import RecipeCard from '@/components/store/RecipeCard';
import { getBlogs } from '@/lib/api';
import { cn } from '@/lib/format';

const TABS = [
  { key: '', label: 'All' },
  { key: 'recipe', label: 'Recipes' },
  { key: 'article', label: 'Tips & Guides' },
];

export default function RecipesPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getBlogs(type ? { type } : {})
      .then((p) => alive && setPosts(Array.isArray(p) ? p : []))
      .catch(() => alive && setPosts([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [type]);

  return (
    <>
      <PageHeader title="Recipes & Spice Tips" subtitle="Cook with confidence — recipes and guides from the Nishree kitchen." crumbs={[{ label: 'Recipes' }]} />
      <Container className="py-10">
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
                type === t.key ? 'brand-gradient text-white' : 'bg-white text-body border border-line hover:border-brand-300',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80" />)}
          </div>
        ) : posts.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => <RecipeCard key={p.id} post={p} />)}
          </div>
        ) : (
          <EmptyState title="No posts yet" message="Fresh recipes are coming soon." />
        )}
      </Container>
    </>
  );
}
