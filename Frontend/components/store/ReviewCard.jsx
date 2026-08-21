import { QuoteDownIcon } from 'hugeicons-react';
import Card from '@/components/ui/Card';
import Rating from '@/components/ui/Rating';
import { mediaUrl } from '@/lib/api';

const fmtDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Shared review card used on both the homepage and the product detail page so
// the design stays identical. Sub-label shows the product (home, cross-product)
// or the date (product page, where they're all the same product).
export default function ReviewCard({ review: r }) {
  const images = Array.isArray(r.ReviewImages) ? r.ReviewImages : [];
  return (
    <Card className="flex h-full flex-col gap-4 p-6">
      <QuoteDownIcon size={28} strokeWidth={2} className="text-brand-200" />
      <p className="clamp-4 flex-1 text-body">{r.review}</p>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={mediaUrl(`/uploads/reviews/${img.fileName}`)}
              alt=""
              className="h-14 w-14 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      <Rating value={r.rating} />
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white">
          {String(r.reviewerName || 'A').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">{r.reviewerName || 'Anonymous'}</p>
          <p className="text-xs text-muted">
            {r.productName ? `on ${r.productName}` : fmtDate(r.createdAt)}
          </p>
        </div>
      </div>
    </Card>
  );
}
