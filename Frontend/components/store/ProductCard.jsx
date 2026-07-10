'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Add01Icon, FavouriteIcon } from 'hugeicons-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PriceTag from '@/components/ui/PriceTag';
import Rating from '@/components/ui/Rating';
import { useCart } from '@/lib/cart-context';
import { mediaUrl } from '@/lib/api';
import { firstImage, productPricing, discountPercent, variationLabel, cn } from '@/lib/format';

// Product tile with a weight/variation picker: pick a pack size and the price +
// add-to-cart update to that variation.
export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const variations = product.ProductVariations || product.variations || [];
  const hasVariants = variations.length > 1;

  const [idx, setIdx] = useState(0);
  const active = variations[idx] || null;

  const fallback = productPricing(product);
  const price = Number(active?.price ?? fallback.price) || 0;
  const compareAt = Number(active?.comparePrice ?? fallback.compareAt) || null;
  const off = discountPercent(price, compareAt);
  const img = mediaUrl(firstImage(product));
  const href = `/products/${product.slug || product.id}`;

  const onAdd = (e) => {
    e.preventDefault();
    const label = active ? variationLabel(active) : '';
    addItem(
      {
        id: product.id,
        variationId: active?.id || null,
        name: label ? `${product.name} (${label})` : product.name,
        price,
        image: img,
      },
      1,
    );
    toast.success('Added to cart');
  };

  return (
    <Card interactive className="group flex flex-col overflow-hidden">
      <Link href={href} className="relative block">
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
          {/* Floating add-to-cart (adds the selected variation) */}
          <button
            type="button"
            onClick={onAdd}
            aria-label="Add to cart"
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl brand-gradient text-white shadow-soft transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Add01Icon size={20} strokeWidth={2.5} />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.avg_rating != null && <Rating value={product.avg_rating} count={product.review_count} />}

        <Link href={href} className="block">
          <h3 className="clamp-2 text-sm font-semibold text-ink hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price — prefixed "From" when there are multiple pack sizes */}
        <div className="flex items-baseline gap-1.5">
          {hasVariants && <span className="text-xs text-muted">From</span>}
          <PriceTag price={price} compareAt={compareAt} size="sm" />
        </div>

        {/* Weight / variation picker */}
        {hasVariants && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {variations.map((v, i) => (
              <button
                key={v.id || i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIdx(i);
                }}
                className={cn(
                  'rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer',
                  i === idx
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-line bg-white text-body hover:border-brand-300 hover:text-brand-600',
                )}
              >
                {variationLabel(v)}
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
