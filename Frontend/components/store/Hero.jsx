'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DeliveryTruck01Icon,
  Tag01Icon,
  Plant01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Award01Icon,
} from 'hugeicons-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getSliders, mediaUrl } from '@/lib/api';
import { cn } from '@/lib/format';

const FEATURES = [
  { icon: DeliveryTruck01Icon, title: 'Free Delivery', note: 'On orders above ₹499' },
  { icon: Tag01Icon, title: 'Honest Prices', note: 'Straight from the source' },
  { icon: Plant01Icon, title: 'Farm Fresh', note: '100% pure & natural' },
];

// Trust/feature strip shown under both the slider and the static hero.
function FeatureStrip({ className }) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-3', className)}>
      {FEATURES.map(({ icon: Icon, title, note }) => (
        <div key={title} className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-soft">
            <Icon size={20} strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">{title}</p>
            <p className="text-xs text-muted">{note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Fallback hero used before the sliders load and when none are configured.
function StaticHero() {
  return (
    <section className="relative overflow-hidden bg-surface-tint">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-100 blur-3xl opacity-60" />
      <Container className="relative grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-16">
        <div>
          <Badge tone="soft" icon={Award01Icon} className="mb-5 animate-fade-up">
            PURE SPICES, FRESHLY PACKED
          </Badge>
          <h1 className="text-4xl font-extrabold leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
            Authentic Spices,
            <br />
            <span className="text-brand-600">Delivered Fresh</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-body">
            Hand-picked, freshly-ground spices and masalas at honest prices —
            straight from the source to your kitchen.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/products" size="lg" iconRight={ArrowRight01Icon}>
              Shop Spices
            </Button>
            <Button href="/products?deals=1" size="lg" variant="secondary" iconRight={Tag01Icon}>
              Explore Deals
            </Button>
          </div>
          <FeatureStrip className="mt-9" />
        </div>

        <div className="relative hidden lg:block">
          <div className="relative mx-auto flex h-[420px] w-full max-w-md items-center justify-center rounded-[2rem] border border-line bg-white p-10 shadow-pop">
            <div className="flex flex-col items-center text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/RTHSRT.png" alt="Nishree" className="h-28 w-auto" />
              <p className="mt-6 text-xl font-semibold tracking-wide text-ink">Pure spices, freshly packed</p>
              <p className="mt-2 text-sm text-muted">From the source to your kitchen.</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// Greyscale shimmer shown while the sliders API is in flight.
function HeroSkeleton() {
  return (
    <section className="bg-surface-tint">
      <Container className="py-6 lg:py-8">
        <div className="shimmer aspect-[4/3] w-full rounded-2xl sm:aspect-[16/7] sm:rounded-[2rem] lg:aspect-[16/6]" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="shimmer h-11 w-11 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="shimmer h-3 w-24 rounded" />
                <div className="shimmer h-2.5 w-32 rounded" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default function Hero() {
  const [slides, setSlides] = useState([]);
  const [idx, setIdx] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSliders()
      .then((list) => setSlides(Array.isArray(list) ? list : []))
      .catch(() => setSlides([]))
      .finally(() => setReady(true));
  }, []);

  const count = slides.length;
  const go = useCallback((n) => setIdx((i) => (count ? (n + count) % count : 0)), [count]);

  // Auto-advance when there's more than one slide.
  useEffect(() => {
    if (count < 2) return undefined;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count]);

  // Keep the index in range if the slide list changes.
  useEffect(() => {
    if (idx >= count) setIdx(0);
  }, [count, idx]);

  // While the sliders API is loading, show a greyscale shimmer — never dummy
  // content. Only after it resolves with no sliders do we fall back.
  if (!ready) return <HeroSkeleton />;
  if (count === 0) return <StaticHero />;

  return (
    <section className="relative overflow-hidden bg-surface-tint">
      <Container className="py-6 lg:py-8">
        <div className="relative overflow-hidden rounded-2xl bg-surface-soft shadow-soft sm:rounded-[2rem]">
          <div className="relative aspect-[4/3] w-full sm:aspect-[16/7] lg:aspect-[16/6]">
            {slides.map((s, i) => (
              <div
                key={s.id || i}
                className={cn(
                  'absolute inset-0 transition-opacity duration-700',
                  i === idx ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
                aria-hidden={i !== idx}
              >
                {s.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(s.image)} alt={s.title || 'Banner'} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full brand-gradient" />
                )}
                {/* readability overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-xl p-6 text-white sm:p-10 lg:p-14">
                    {s.title && (
                      <h1 className="clamp-2 text-2xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                        {s.title}
                      </h1>
                    )}
                    {s.description && (
                      <p className="clamp-2 mt-2 max-w-md text-sm text-white/90 drop-shadow sm:mt-3 sm:text-lg">{s.description}</p>
                    )}
                    {(s.buttonText || s.link) && (
                      <Button href={s.link || '/products'} className="mt-4 sm:mt-6 sm:h-12 sm:px-7 sm:text-base" iconRight={ArrowRight01Icon}>
                        {s.buttonText || 'Shop Now'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={() => go(idx - 1)}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink shadow-soft transition hover:bg-white cursor-pointer sm:left-5"
                >
                  <ArrowLeft01Icon size={20} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={() => go(idx + 1)}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink shadow-soft transition hover:bg-white cursor-pointer sm:right-5"
                >
                  <ArrowRight01Icon size={20} strokeWidth={2} />
                </button>
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={() => setIdx(i)}
                      className={cn(
                        'h-2 rounded-full transition-all',
                        i === idx ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/80',
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <FeatureStrip className="mt-8" />
      </Container>
    </section>
  );
}
