'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Container from '@/components/ui/Container';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/store/ProductCard';
import { getProducts, getCategories } from '@/lib/api';

export default function CollectionView({ slug }) {
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState('Collection');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [prods, cats] = await Promise.all([
          getProducts({ category: slug }).catch(() => []),
          getCategories().catch(() => []),
        ]);
        if (!alive) return;
        setProducts(Array.isArray(prods) ? prods : []);
        const match = (Array.isArray(cats) ? cats : []).find(
          (c) => String(c.id) === String(slug) || c.slug === slug,
        );
        if (match) setTitle(match.name);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  return (
    <>
      <PageHeader title={title} subtitle="Explore this collection." crumbs={[{ label: 'Products', href: '/products' }, { label: title }]} />
      <Container className="py-10">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : products.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <EmptyState title="No products in this collection yet" action={<Button href="/products">Browse all products</Button>} />
        )}
      </Container>
    </>
  );
}
