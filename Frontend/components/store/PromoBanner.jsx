import { Tag01Icon, ArrowRight01Icon } from 'hugeicons-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

// Offer band between the catalogue and the story sections.
export default function PromoBanner() {
  return (
    <Container className="py-8">
      <div className="relative overflow-hidden rounded-3xl brand-gradient px-6 py-10 text-white sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10" />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
              <Tag01Icon size={15} strokeWidth={2} /> Limited-time offer
            </span>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Get 10% off your first spice order</h2>
            <p className="mt-1 text-white/85">
              Use code <span className="font-bold">SPICE10</span> at checkout. Free delivery over ₹499.
            </p>
          </div>
          <Button href="/products" variant="secondary" size="lg" iconRight={ArrowRight01Icon}>
            Shop Now
          </Button>
        </div>
      </div>
    </Container>
  );
}
