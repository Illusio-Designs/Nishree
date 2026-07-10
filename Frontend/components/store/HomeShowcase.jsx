'use client';

import { useEffect, useState } from 'react';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Skeleton from '@/components/ui/Skeleton';
import CategoryCard from '@/components/store/CategoryCard';
import ProductCard from '@/components/store/ProductCard';
import { getCategories, getProducts } from '@/lib/api';

export default function HomeShowcase() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [cats, prods] = await Promise.all([
          getCategories().catch(() => []),
          getProducts({ limit: 10 }).catch(() => []),
        ]);
        if (!alive) return;
        setCategories(Array.isArray(cats) ? cats.slice(0, 12) : []);
        setProducts(Array.isArray(prods) ? prods.slice(0, 10) : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      {/* Shop by Category */}
      <Container className="py-12">
        <SectionHeading title="Shop by Spice Category" subtitle="Whole spices, ground masalas and signature blends." center />
        {loading ? (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : categories.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">Our spice collection is coming soon.</p>
        )}
      </Container>

      {/* Best Deals */}
      <Container className="py-8">
        <SectionHeading title="Bestselling Spices" actionLabel="View All Deals" actionHref="/products?deals=1" />
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        ) : products.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">Fresh spice deals are on the way.</p>
        )}
      </Container>
    </>
  );
}
