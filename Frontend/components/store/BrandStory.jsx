import { Plant01Icon, FireIcon, PackageIcon, Award01Icon } from 'hugeicons-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

const POINTS = [
  { icon: Plant01Icon, title: 'Sourced direct', text: 'Bought straight from growers — no middlemen, no fillers.' },
  { icon: FireIcon, title: 'Roasted & ground fresh', text: 'Small-batch roasting and grinding locks in the aroma.' },
  { icon: PackageIcon, title: 'Sealed for freshness', text: 'Airtight packing so every pinch tastes just-ground.' },
  { icon: Award01Icon, title: '100% purity', text: 'Lab-checked for purity — exactly what the label says.' },
];

export default function BrandStory() {
  return (
    <div className="bg-surface-tint py-14">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-700">
              Our promise
            </span>
            <h2 className="mt-4 text-3xl font-bold text-ink">From farm to your kitchen, freshly ground</h2>
            <p className="mt-4 text-body">
              Great cooking starts with great spices. We source whole spices at their
              peak, roast and grind them in small batches, and seal in the aroma — so
              what reaches your kitchen tastes the way spices are meant to.
            </p>
            <Button href="/about" className="mt-6" variant="secondary">Learn more about us</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {POINTS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-line bg-white p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Icon size={20} strokeWidth={2} />
                </span>
                <h3 className="mt-3 font-bold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-body">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
