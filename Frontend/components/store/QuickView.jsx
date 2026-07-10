'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Cancel01Icon, ShoppingCart01Icon, ArrowRight01Icon } from 'hugeicons-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PriceTag from '@/components/ui/PriceTag';
import Rating from '@/components/ui/Rating';
import { useCart } from '@/lib/cart-context';
import { mediaUrl } from '@/lib/api';
import { firstImage, productPricing, discountPercent, variationLabel, cn } from '@/lib/format';

// Fast product preview modal opened from the card's eye icon.
export default function QuickView({ product, open, onClose }) {
  const { addItem } = useCart();
  const variations = product?.ProductVariations || product?.variations || [];
  const hasVariants = variations.length > 1;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (open) {
      setIdx(0);
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open || !product) return null;

  const active = variations[idx] || null;
  const fallback = productPricing(product);
  const price = Number(active?.price ?? fallback.price) || 0;
  const compareAt = Number(active?.comparePrice ?? fallback.compareAt) || null;
  const off = discountPercent(price, compareAt);
  const img = mediaUrl(firstImage(product));
  const href = `/products/${product.slug || product.id}`;

  const onAdd = () => {
    const label = active ? variationLabel(active) : '';
    addItem({ id: product.id, variationId: active?.id || null, name: label ? `${product.name} (${label})` : product.name, price, image: img }, 1);
    toast.success('Added to cart');
  };

  const modal = (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative grid max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-t-3xl bg-white shadow-pop sm:rounded-3xl md:grid-cols-2">
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft hover:text-brand-600 cursor-pointer">
          <Cancel01Icon size={20} strokeWidth={2} />
        </button>

        <div className="relative aspect-square w-full overflow-hidden bg-surface-soft md:aspect-auto md:min-h-[420px]">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          {off > 0 && <span className="absolute left-3 top-3 z-10"><Badge tone="brand">{off}% OFF</Badge></span>}
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto p-6">
          {product.category?.name && <Badge tone="soft" className="w-max">{product.category.name}</Badge>}
          <h2 className="text-xl font-bold text-ink">{product.name}</h2>
          {product.avg_rating != null && <Rating value={product.avg_rating} count={product.review_count} />}

          <div className="flex items-baseline gap-1.5">
            {hasVariants && <span className="text-xs text-muted">From</span>}
            <PriceTag price={price} compareAt={compareAt} size="md" />
          </div>

          {product.description && <p className="clamp-2 text-sm text-body">{product.description}</p>}

          {hasVariants && (
            <div className="flex flex-wrap gap-1.5">
              {variations.map((v, i) => (
                <button
                  key={v.id || i}
                  onClick={() => setIdx(i)}
                  className={cn(
                    'rounded-md border px-2.5 py-1 text-xs font-semibold uppercase transition-colors cursor-pointer',
                    i === idx ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-white text-body hover:border-brand-300',
                  )}
                >
                  {variationLabel(v)}
                </button>
              ))}
            </div>
          )}

          <div className="mt-2 flex flex-col gap-2">
            <Button icon={ShoppingCart01Icon} onClick={onAdd} fullWidth>Add to Cart</Button>
            <Link href={href} onClick={onClose} className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              View full details <ArrowRight01Icon size={15} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Portal to <body> so the fixed overlay isn't trapped by the card's transform.
  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null;
}
