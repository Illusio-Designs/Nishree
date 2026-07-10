import Link from 'next/link';
import {
  Location01Icon,
  Call02Icon,
  Mail01Icon,
  Facebook01Icon,
  InstagramIcon,
  NewTwitterIcon,
} from 'hugeicons-react';
import Container from '@/components/ui/Container';
import Logo from '@/components/ui/Logo';

const COLS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Spices', href: '/products' },
      { label: 'Deals', href: '/products?deals=1' },
      { label: 'Wholesale', href: '/wholesale' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Recipes', href: '/recipes' },
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
      <Container className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-body">
            Authentic, freshly-ground spices and masalas at honest prices,
            delivered to your doorstep.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-body">
            <li className="flex items-center gap-2">
              <Location01Icon size={17} strokeWidth={2} className="text-brand-600" />
              Ahmedabad, Gujarat, India
            </li>
            <li className="flex items-center gap-2">
              <Call02Icon size={17} strokeWidth={2} className="text-brand-600" />
              +91 00000 00000
            </li>
            <li className="flex items-center gap-2">
              <Mail01Icon size={17} strokeWidth={2} className="text-brand-600" />
              info@illusiodesigns.agency
            </li>
          </ul>
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

      <div className="border-t border-line">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-sm text-muted">© {new Date().getFullYear()} Nishree. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {SOCIAL.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-body transition-colors hover:bg-brand-600 hover:text-white"
              >
                <Icon size={18} strokeWidth={2} />
              </a>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}
