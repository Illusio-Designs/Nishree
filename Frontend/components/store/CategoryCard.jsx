import Link from 'next/link';
import { mediaUrl } from '@/lib/api';
import { firstImage } from '@/lib/format';

// Rounded category tile for the "Shop by Category" rail.
export default function CategoryCard({ category }) {
  const img = mediaUrl(firstImage(category) || category.image);
  const count = category.product_count ?? category.productCount;

  return (
    <Link
      href={`/collections/${category.slug || category.id}`}
      className="group flex w-full flex-col items-center rounded-2xl border border-line bg-white p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
    >
      <div className="mb-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-surface-tint">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <span className="text-2xl">🌶️</span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-ink group-hover:text-brand-600 transition-colors">
        {category.name}
      </h3>
      {count != null && <p className="mt-0.5 text-xs text-muted">{count}+ items</p>}
    </Link>
  );
}
