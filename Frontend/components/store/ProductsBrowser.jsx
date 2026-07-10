'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search01Icon, FilterIcon, Cancel01Icon } from 'hugeicons-react';
import Container from '@/components/ui/Container';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/store/ProductCard';
import { getProducts, getCategories } from '@/lib/api';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
];

export default function ProductsBrowser() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('newest');
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    getCategories().then((c) => setCategories(Array.isArray(c) ? c : [])).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const params = {};
    if (initialSearch) params.search = initialSearch;
    if (initialCategory) params.category = initialCategory;
    getProducts(params)
      .then((p) => alive && setProducts(Array.isArray(p) ? p : []))
      .catch(() => alive && setProducts([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [initialSearch, initialCategory]);

  const submitSearch = (e) => {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (search.trim()) qs.set('search', search.trim());
    if (category) qs.set('category', category);
    router.push(`/products${qs.toString() ? `?${qs}` : ''}`);
  };

  // Client-side sort of the fetched set.
  const visible = useMemo(() => {
    const list = [...products];
    const price = (p) => Number(p?.ProductVariations?.[0]?.price ?? p?.price ?? 0);
    if (sort === 'price_asc') list.sort((a, b) => price(a) - price(b));
    else if (sort === 'price_desc') list.sort((a, b) => price(b) - price(a));
    else if (sort === 'name') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return list;
  }, [products, sort]);

  const Filters = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-bold text-ink">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => setCategory('')}
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors cursor-pointer ${!category ? 'bg-brand-50 font-semibold text-brand-700' : 'text-body hover:bg-surface-soft'}`}
          >
            All Products
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(String(c.id))}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors cursor-pointer ${String(category) === String(c.id) ? 'bg-brand-50 font-semibold text-brand-700' : 'text-body hover:bg-surface-soft'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <Button fullWidth onClick={submitSearch}>Apply Filters</Button>
    </div>
  );

  return (
    <Container className="py-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={submitSearch} className="relative flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="h-11 w-full rounded-full border border-line bg-white pl-4 pr-11 text-sm text-ink placeholder:text-muted focus-ring"
          />
          <button type="submit" aria-label="Search" className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full brand-gradient text-white cursor-pointer">
            <Search01Icon size={17} strokeWidth={2} />
          </button>
        </form>
        <div className="flex items-center gap-2">
          <div className="w-48">
            <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>
          <Button variant="secondary" icon={FilterIcon} className="lg:hidden" onClick={() => setMobileFilters(true)}>
            Filters
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-line bg-white p-5">{Filters}</div>
        </aside>

        {/* Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
            </div>
          ) : visible.length ? (
            <>
              <p className="mb-4 text-sm text-muted">{visible.length} product{visible.length !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {visible.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </>
          ) : (
            <EmptyState title="No products found" message="Try a different search or category." action={<Button href="/products">Reset</Button>} />
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Filters</h2>
              <button onClick={() => setMobileFilters(false)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-soft cursor-pointer">
                <Cancel01Icon size={20} strokeWidth={2} />
              </button>
            </div>
            {Filters}
          </div>
        </div>
      )}
    </Container>
  );
}
