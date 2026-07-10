import {
  DeliveryTruck01Icon,
  Tag01Icon,
  Plant01Icon,
  ArrowRight01Icon,
  Award01Icon,
} from 'hugeicons-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const FEATURES = [
  { icon: DeliveryTruck01Icon, title: 'Free Delivery', note: 'On orders above ₹499' },
  { icon: Tag01Icon, title: 'Honest Prices', note: 'Straight from the source' },
  { icon: Plant01Icon, title: 'Farm Fresh', note: '100% pure & natural' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface-tint">
      {/* soft brand glow */}
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

          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        </div>

        {/* Visual */}
        <div className="relative hidden lg:block">
          <div className="relative mx-auto flex h-[420px] w-full max-w-md items-center justify-center rounded-[2rem] brand-gradient text-white shadow-pop">
            <div className="text-center">
              <p className="text-7xl font-black">50%</p>
              <p className="mt-1 text-xl font-semibold tracking-wide">UP TO OFF</p>
              <p className="mt-4 text-sm text-white/80">On your first spice order</p>
            </div>
            <span className="animate-floaty absolute right-6 top-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-2xl backdrop-blur">
              🌶️
            </span>
            <span className="animate-floaty absolute bottom-6 left-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-2xl backdrop-blur" style={{ animationDelay: '1.5s' }}>
              🧂
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
