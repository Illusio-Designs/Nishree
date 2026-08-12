'use client';

import { useEffect, useState } from 'react';
import { FavouriteIcon } from 'hugeicons-react';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ProductCard from '@/components/store/ProductCard';
import { getWishlist } from '@/lib/wishlist-api';
import { useWishlist } from '@/lib/wishlist-context';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ids } = useWishlist();

  const load = () => {
    setLoading(true);
    getWishlist()
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Reflect removals made from the cards without a full refetch.
  const visible = items.filter((p) => ids.has(Number(p.id)));

  return (
    <>
      <PageHeader title="My Wishlist" subtitle="Spices you've saved for later." crumbs={[{ label: 'Wishlist' }]} />
      <Container className="py-10">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={30} /></div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={FavouriteIcon}
            title="Your wishlist is empty"
            message="Tap the heart on any product to save it here."
            action={<Button href="/products">Browse Spices</Button>}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
