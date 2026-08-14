import Link from 'next/link';
import {
  Location01Icon,
  Call02Icon,
  Mail01Icon,
  Facebook01Icon,
  InstagramIcon,
  NewTwitterIcon,
  Mail02Icon,
  DeliveryTruck01Icon,
  CreditCardIcon,
} from 'hugeicons-react';
import Container from '@/components/ui/Container';
import Logo from '@/components/ui/Logo';
import NewsletterForm from '@/components/layout/NewsletterForm';

const COLS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Spices', href: '/products' },
      { label: 'Deals', href: '/products?deals=1' },
      { label: 'Wholesale', href: '/wholesale' },
      { label: 'Recipes', href: '/recipes' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Policies', href: '/policies' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', href: '/login' },
      { label: 'Register', href: '/register' },
      { label: 'My Profile', href: '/profile' },
      { label: 'My Orders', href: '/profile' },
    ],
  },
];

const SOCIAL = [
  { icon: Facebook01Icon, label: 'Facebook', href: '#' },
  { icon: InstagramIcon, label: 'Instagram', href: '#' },
  { icon: NewTwitterIcon, label: 'Twitter', href: '#' },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface-soft">
      {/* Newsletter band */}
      <div className="border-b border-line">
        <Container className="flex flex-col items-start justify-between gap-6 py-8 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Mail02Icon size={20} strokeWidth={2} />
            </span>
            <div>
              <h3 className="text-lg font-bold text-ink">Join the Nishree kitchen</h3>
              <p className="text-sm text-body">Recipes, spice tips and subscriber-only offers — straight to your inbox.</p>
            </div>
          </div>
          <NewsletterForm />
        </Container>
      </div>

      {/* Main columns */}
      <Container className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-body">
            Authentic, freshly-ground spices and masalas at honest prices,
            delivered to your doorstep.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-body">
            <li className="flex items-start gap-2.5">
              <Location01Icon size={17} strokeWidth={2} className="mt-0.5 shrink-0 text-brand-600" />
              Ahmedabad, Gujarat, India
            </li>
            <li>
              <a href="tel:+910000000000" className="flex items-center gap-2.5 transition-colors hover:text-brand-600">
                <Call02Icon size={17} strokeWidth={2} className="shrink-0 text-brand-600" />
                +91 00000 00000
              </a>
            </li>
            <li>
              <a href="mailto:info@illusiodesigns.agency" className="flex items-center gap-2.5 transition-colors hover:text-brand-600">
                <Mail01Icon size={17} strokeWidth={2} className="shrink-0 text-brand-600" />
                info@illusiodesigns.agency
              </a>
            </li>
          </ul>

          <div className="mt-5 flex items-center gap-2">
            {SOCIAL.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-body shadow-soft transition-colors hover:bg-brand-600 hover:text-white"
              >
                <Icon size={18} strokeWidth={2} />
              </a>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-bold text-ink">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-body transition-colors hover:text-brand-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-line">
        <Container className="flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <p className="text-center text-sm text-muted sm:text-left">
            © {new Date().getFullYear()} Nishree. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-muted">
            <span className="inline-flex items-center gap-1.5">
              <DeliveryTruck01Icon size={15} strokeWidth={2} className="text-brand-600" />
              Cash on Delivery
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CreditCardIcon size={15} strokeWidth={2} className="text-brand-600" />
              Prepaid / UPI
            </span>
          </div>
        </Container>
      </div>
    </footer>
  );
}
