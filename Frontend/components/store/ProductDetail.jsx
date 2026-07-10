'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import {
  ShoppingCart01Icon,
  FavouriteIcon,
  DeliveryTruck01Icon,
  ReturnRequestIcon,
  Shield01Icon,
  ArrowRight01Icon,
} from 'hugeicons-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PriceTag from '@/components/ui/PriceTag';
import Rating from '@/components/ui/Rating';
import QuantityStepper from '@/components/ui/QuantityStepper';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { getProduct, mediaUrl } from '@/lib/api';
import { productPricing, discountPercent, firstImage } from '@/lib/format';
import { useCart } from '@/lib/cart-context';

const PERKS = [
  { icon: DeliveryTruck01Icon, text: 'Free delivery over ₹499' },
  { icon: ReturnRequestIcon, text: 'Easy 7-day returns' },
  { icon: Shield01Icon, text: 'Secure checkout' },
];

export default function ProductDetail({ id }) {
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [variationIdx, setVariationIdx] = useState(0);

  useEffect(() => {
    let alive = true;
    getProduct(id)
      .then((p) => alive && setProduct(p))
      .catch(() => alive && setProduct(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-square" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-16">
        <EmptyState title="Product not found" message="This product may have been removed." action={<Button href="/products">Back to Products</Button>} />
      </Container>
    );
  }

  const variations = product.ProductVariations || product.variations || [];
  const variation = variations[variationIdx] || null;
  const { price, compareAt } = productPricing({ ...product, ProductVariations: variation ? [variation] : variations });
  const off = discountPercent(price, compareAt);

  const images =
    (product.ProductImages || product.images || [])
      .map((i) => mediaUrl(i.url || i.image || i.path))
      .filter(Boolean);
  if (images.length === 0) {
    const f = mediaUrl(firstImage(product));
    if (f) images.push(f);
  }

  const inStock = variation ? Number(variation.stock ?? 1) > 0 : true;

  const onAdd = () => {
    addItem(
      {
        id: product.id,
        variationId: variation?.id || null,
        name: product.name,
        price,
        image: images[0] || '',
      },
      qty,
    );
    toast.success('Added to cart');
  };

  return (
    <>
      <Container className="py-4">
        <nav className="flex items-center gap-1 text-sm text-muted">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <ArrowRight01Icon size={14} strokeWidth={2} />
          <Link href="/products" className="hover:text-brand-600">Products</Link>
          <ArrowRight01Icon size={14} strokeWidth={2} />
          <span className="text-ink clamp-1">{product.name}</span>
        </nav>
      </Container>

      <Container className="pb-14">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-surface-soft">
              {images[activeImg] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[activeImg]} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted">No image</div>
              )}
              {off > 0 && <span className="absolute left-4 top-4"><Badge tone="brand">{off}% OFF</Badge></span>}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${i === activeImg ? 'border-brand-600' : 'border-line'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.category?.name && <Badge tone="soft" className="mb-3">{product.category.name}</Badge>}
            <h1 className="text-3xl font-bold text-ink">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              {product.avg_rating != null && <Rating value={product.avg_rating} count={product.review_count} />}
              <Badge tone={inStock ? 'success' : 'neutral'}>{inStock ? 'In stock' : 'Out of stock'}</Badge>
            </div>

            <div className="mt-5"><PriceTag price={price} compareAt={compareAt} size="lg" /></div>

            {product.description && (
              <p className="mt-5 leading-relaxed text-body">{product.description}</p>
            )}

            {/* Variations */}
            {variations.length > 1 && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold text-ink">Options</p>
                <div className="flex flex-wrap gap-2">
                  {variations.map((v, i) => (
                    <button
                      key={v.id || i}
                      onClick={() => setVariationIdx(i)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${i === variationIdx ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-line text-body hover:border-brand-300'}`}
                    >
                      {v.sku || v.name || Object.values(v.attributes || {}).join(' / ') || `Variant ${i + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <QuantityStepper value={qty} onChange={setQty} />
              <Button size="lg" icon={ShoppingCart01Icon} onClick={onAdd} disabled={!inStock}>
                Add to Cart
              </Button>
              <Button size="lg" variant="secondary" icon={FavouriteIcon} aria-label="Wishlist">
                Save
              </Button>
            </div>

            {/* Perks */}
            <div className="mt-8 grid gap-3 rounded-2xl border border-line bg-surface-soft p-5 sm:grid-cols-3">
              {PERKS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-body">
                  <Icon size={20} strokeWidth={2} className="text-brand-600" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
