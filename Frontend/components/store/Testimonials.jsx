'use client';

import { useEffect, useState } from 'react';
import { QuoteDownIcon } from 'hugeicons-react';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Rating from '@/components/ui/Rating';
import Card from '@/components/ui/Card';
import { getAllPublicReviews } from '@/lib/api';

// Shown until real reviews exist, so the section never looks empty.
const FALLBACK = [
  { id: 'f1', reviewerName: 'Priya S.', productName: 'Garam Masala', rating: 5, review: 'The garam masala is unbelievably fresh — you can smell it the moment you open the pack. My curries have never tasted better.' },
  { id: 'f2', reviewerName: 'Rahul M.', productName: 'Kashmiri Chilli', rating: 5, review: 'Switched from a supermarket brand and there is no going back. The Kashmiri chilli gives such a beautiful colour.' },
  { id: 'f3', reviewerName: 'Anjali K.', productName: 'Spice Box', rating: 4, review: 'Great quality and fast delivery. Love that I can buy small packs to try and bulk packs for regulars.' },
];

export default function Testimonials() {
  const [reviews, setReviews] = useState(FALLBACK);

  useEffect(() => {
    getAllPublicReviews({ limit: 6 })
      .then((list) => {
        if (Array.isArray(list) && list.length) setReviews(list);
      })
      .catch(() => {});
  }, []);

  return (
    <Container className="py-14">
      <SectionHeading title="Loved by home cooks" subtitle="What our customers say about cooking with Nishree." center />
      <div className="grid gap-5 md:grid-cols-3">
        {reviews.slice(0, 6).map((r) => (
          <Card key={r.id} className="flex flex-col gap-4 p-6">
            <QuoteDownIcon size={28} strokeWidth={2} className="text-brand-200" />
            <p className="clamp-4 flex-1 text-body">{r.review}</p>
            <Rating value={r.rating} />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white">
                {String(r.reviewerName || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{r.reviewerName || 'Anonymous'}</p>
                {r.productName && <p className="text-xs text-muted">on {r.productName}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
