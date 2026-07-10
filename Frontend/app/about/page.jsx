import {
  DeliveryTruck01Icon,
  Tag01Icon,
  Plant01Icon,
  CustomerSupportIcon,
  Award01Icon,
  UserGroupIcon,
} from 'hugeicons-react';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';

export const metadata = { title: 'About Us' };

const VALUES = [
  { icon: Plant01Icon, title: 'Pure & Natural', text: 'No fillers, no additives — just clean, single-origin spices and honest blends.' },
  { icon: Tag01Icon, title: 'Fair Prices', text: 'Sourced direct from growers so you pay for the spice, not the middlemen.' },
  { icon: DeliveryTruck01Icon, title: 'Freshly Ground', text: 'Ground in small batches and sealed for aroma, then shipped fast to your door.' },
  { icon: CustomerSupportIcon, title: 'Real Support', text: 'A friendly team ready to help with recipes, bulk orders and anything else.' },
];

const STATS = [
  { value: '50k+', label: 'Happy kitchens' },
  { value: '120+', label: 'Spices & blends' },
  { value: '99%', label: 'On-time delivery' },
  { value: '4.8★', label: 'Average rating' },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Nishree"
        subtitle="We're on a mission to bring pure, freshly-ground spices from the farm to every kitchen — affordably."
        crumbs={[{ label: 'About Us' }]}
      />

      <Container className="py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              <Award01Icon size={15} strokeWidth={2} /> Our Story
            </span>
            <h2 className="mt-4 text-3xl font-bold text-ink">Spices, the way they're meant to taste</h2>
            <p className="mt-4 text-body">
              Nishree started with a simple idea: everyone deserves access to pure,
              aromatic spices without the premium price tag. We source whole spices
              directly from growers, grind them in small batches, and seal in the
              aroma — so every pinch tastes the way it should.
            </p>
            <p className="mt-3 text-body">
              Today we serve home cooks and businesses alike, pairing authentic
              flavour with dependable service you can count on.
            </p>
            <div className="mt-6 flex gap-3">
              <Button href="/products">Start Shopping</Button>
              <Button href="/contact" variant="secondary">Contact Us</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-surface-soft p-6 text-center">
                <p className="text-3xl font-extrabold text-brand-600">{s.value}</p>
                <p className="mt-1 text-sm text-body">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <div className="bg-surface-soft py-14">
        <Container>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-ink">What we stand for</h2>
            <p className="mt-2 text-body">The values behind every order we deliver.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-line bg-white p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Icon size={22} strokeWidth={2} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm text-body">{text}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-14">
        <div className="flex flex-col items-center gap-4 rounded-3xl brand-gradient px-8 py-12 text-center text-white">
          <UserGroupIcon size={36} strokeWidth={2} />
          <h2 className="text-2xl font-bold sm:text-3xl">Join the Nishree family</h2>
          <p className="max-w-xl text-white/85">
            Create an account today and unlock members-only spice deals, faster
            checkout, and exclusive offers.
          </p>
          <Button href="/register" variant="secondary" size="lg">Create Account</Button>
        </div>
      </Container>
    </>
  );
}
