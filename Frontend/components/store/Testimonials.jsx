'use client';

import { useEffect, useState } from 'react';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import ReviewCard from '@/components/store/ReviewCard';
import { getAllPublicReviews } from '@/lib/api';

// Real approved reviews only — the section hides itself when there are none.
// It auto-slides infinitely once there are more reviews than fit on screen:
// desktop shows 3 (slides at >3), tablet 2, mobile 1 (slides at >1).
export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [perView, setPerView] = useState(3);

  useEffect(() => {
    getAllPublicReviews({ limit: 12 })
      .then((list) => setReviews(Array.isArray(list) ? list : []))
      .catch(() => setReviews([]));
  }, []);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setPerView(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  if (!reviews.length) return null;

  const slide = reviews.length > perView;
  const items = slide ? [...reviews, ...reviews] : reviews;
  const duration = Math.max(20, reviews.length * 6);

  return (
    <Container className="py-14">
      <SectionHeading title="Loved by home cooks" subtitle="What our customers say about cooking with Nishree." center />

      {slide ? (
        <div className="group marquee-mask overflow-hidden">
          <ul
            className="flex w-max animate-marquee will-change-transform group-hover:[animation-play-state:paused]"
            style={{ '--marquee-duration': `${duration}s` }}
          >
            {items.map((r, i) => (
              <li key={`${r.id}-${i}`} className="w-[82vw] max-w-[380px] shrink-0 pr-5 sm:w-[44vw] lg:w-[30vw]">
                <ReviewCard review={r} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-5">
          {reviews.map((r) => (
            <div key={r.id} className="w-full max-w-[380px] sm:w-[44%] lg:w-[30%]">
              <ReviewCard review={r} />
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
