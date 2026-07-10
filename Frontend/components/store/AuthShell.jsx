import Link from 'next/link';
import { Award01Icon, DeliveryTruck01Icon, Tag01Icon } from 'hugeicons-react';
import Container from '@/components/ui/Container';
import Logo from '@/components/ui/Logo';

const PERKS = [
  { icon: DeliveryTruck01Icon, text: 'Free delivery on orders above ₹499' },
  { icon: Tag01Icon, text: 'Members-only spice deals every week' },
  { icon: Award01Icon, text: '100% purity guarantee' },
];

// Two-column shell shared by login & register: brand panel + form card.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-line bg-white shadow-card lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between brand-gradient p-10 text-white lg:flex">
          <Logo className="[&_span:last-child]:text-white [&_.text-brand-600]:text-white" />
          <div>
            <h2 className="text-3xl font-bold leading-tight">Authentic spices, delivered to your kitchen.</h2>
            <ul className="mt-6 space-y-3">
              {PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-white/90">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-white/70">© {new Date().getFullYear()} Nishree</p>
        </div>

        {/* Form */}
        <div className="p-8 sm:p-10">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-body">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-body">{footer}</div>}
        </div>
      </div>
    </Container>
  );
}

export { Link };
