'use client';

import Link from 'next/link';
import { ShoppingCart01Icon, FavouriteIcon } from 'hugeicons-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PriceTag from '@/components/ui/PriceTag';
import Rating from '@/components/ui/Rating';
import { useCart } from '@/lib/cart-context';
import { mediaUrl } from '@/lib/api';
import { firstImage, productPricing, discountPercent } from '@/lib/format';

// Product tile used across Home, Products listing and Collection pages.
export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { price, compareAt } = productPricing(product);
  const off = discountPercent(price, compareAt);
  const img = mediaUrl(firstImage(product));

  const onAdd = (e) => {
    e.preventDefault();
    addItem({ id: product.id, name: product.name, price, image: img }, 1);
  };

  return (
    <Card interactive className="group flex flex-col overflow-hidden">
      <Link href={`/products/${product.slug || product.id}`} className="relative block">
        <div className="relative aspect-square overflow-hidden bg-surface-soft">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted text-sm">No image</div>
          )}
          {off > 0 && (
            <span className="absolute left-3 top-3">
              <Badge tone="brand">{off}% OFF</Badge>
            </span>
          )}
          <button
            type="button"
            aria-label="Add to wishlist"
            onClick={(e) => e.preventDefault()}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow-soft transition-opacity duration-200 hover:text-brand-600 group-hover:opacity-100 cursor-pointer"
          >
            <FavouriteIcon size={16} strokeWidth={2} />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.avg_rating != null && (
          <Rating value={product.avg_rating} count={product.review_count} />
        )}
        <Link href={`/products/${product.slug || product.id}`} className="block">
          <h3 className="clamp-2 text-sm font-semibold text-ink hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        {(product.unit || product.category?.name) && (
          <p className="text-xs text-muted">{product.unit || product.category?.name}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-1">
          <PriceTag price={price} compareAt={compareAt} size="sm" />
          <button
            type="button"
            onClick={onAdd}
            aria-label="Add to cart"
            className="flex h-9 w-9 items-center justify-center rounded-full brand-gradient text-white shadow-soft transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ShoppingCart01Icon size={17} strokeWidth={2} />
          </button>
        </div>
      </div>
    </Card>
  );
}
