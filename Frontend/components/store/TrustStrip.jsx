import {
  Shield01Icon,
  ReturnRequestIcon,
  CustomerSupportIcon,
  GiftIcon,
} from 'hugeicons-react';
import Container from '@/components/ui/Container';

const ITEMS = [
  { icon: Shield01Icon, title: 'Secure Payments', note: '100% secure transactions' },
  { icon: ReturnRequestIcon, title: 'Easy Returns', note: 'Hassle-free returns' },
  { icon: CustomerSupportIcon, title: '24/7 Support', note: "We're here to help" },
  { icon: GiftIcon, title: 'Member Benefits', note: 'Exclusive offers & discounts' },
];

export default function TrustStrip() {
  return (
    <Container className="py-4">
      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-line bg-surface-soft p-6 sm:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, note }) => (
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
    </Container>
  );
}
