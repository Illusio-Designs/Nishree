'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  DashboardSquare01Icon,
  PackageIcon,
  ShoppingBag02Icon,
  Menu01Icon,
  Cancel01Icon,
  Logout01Icon,
  Store01Icon,
  UserGroupIcon,
  Tag01Icon,
  UserMultiple02Icon,
  Building01Icon,
  DeliveryTruck01Icon,
  Route02Icon,
  Calendar03Icon,
  DiscountTag02Icon,
  BookOpen01Icon,
  Mail01Icon,
} from 'hugeicons-react';
import Logo from '@/components/ui/Logo';
import Spinner from '@/components/ui/Spinner';
import { getUser, clearSession, isLoggedIn } from '@/lib/auth';
import { cn } from '@/lib/format';

const NAV = [
  {
    section: 'Store',
    items: [
      { label: 'Overview', href: '/dashboard', icon: DashboardSquare01Icon },
      { label: 'Products', href: '/dashboard/products', icon: PackageIcon },
      { label: 'Orders', href: '/dashboard/orders', icon: ShoppingBag02Icon },
      { label: 'Categories', href: '/dashboard/categories', icon: Store01Icon },
      { label: 'Coupons', href: '/dashboard/coupons', icon: DiscountTag02Icon },
      { label: 'Customers', href: '/dashboard/users', icon: UserGroupIcon },
    ],
  },
  {
    section: 'Content',
    items: [
      { label: 'Recipes & Blog', href: '/dashboard/blog', icon: BookOpen01Icon },
    ],
  },
  {
    section: 'B2B',
    items: [
      { label: 'Parties', href: '/dashboard/parties', icon: Store01Icon },
      { label: 'Distributors', href: '/dashboard/distributors', icon: Building01Icon },
      { label: 'Salesmen', href: '/dashboard/salesmen', icon: UserMultiple02Icon },
      { label: 'Journeys', href: '/dashboard/journeys', icon: Route02Icon },
      { label: 'B2B Orders', href: '/dashboard/b2b-orders', icon: DeliveryTruck01Icon },
      { label: 'Wholesale Leads', href: '/dashboard/wholesale', icon: Mail01Icon },
      { label: 'Offers', href: '/dashboard/offers', icon: Tag01Icon },
      { label: 'Events', href: '/dashboard/events', icon: Calendar03Icon },
    ],
  },
];

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login?redirect=/dashboard');
      return;
    }
    const u = getUser();
    setUser(u);
    // Managers + admin may use the dashboard; the API still enforces per-route scope.
    const role = u?.role || '';
    setAllowed(role === 'admin' || role.endsWith('_manager') || ['sales_manager', 'distributor_manager'].includes(role) || role === 'admin');
    setReady(true);
  }, [router]);

  const onLogout = () => {
    clearSession();
    router.push('/');
  };

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center"><Spinner size={32} /></div>;
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-2xl font-bold text-ink">Admin access required</h1>
        <p className="text-body">This area is for store administrators and managers.</p>
        <Link href="/" className="font-semibold text-brand-600 hover:text-brand-700">Back to store</Link>
      </div>
    );
  }

  const isActive = (href) => (href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href));

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-line px-5">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {NAV.map((group) => (
          <div key={group.section} className="mb-4">
            <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-muted">{group.section}</p>
            {group.items.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(href) ? 'bg-brand-50 text-brand-700' : 'text-body hover:bg-surface-soft',
                )}
              >
                <Icon size={19} strokeWidth={2} />
                {label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <button
        onClick={onLogout}
        className="m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-red-50 cursor-pointer"
      >
        <Logout01Icon size={19} strokeWidth={2} />
        Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white lg:block">{Sidebar}</aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-pop">{Sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} aria-label="Menu" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-soft lg:hidden cursor-pointer">
            <Menu01Icon size={22} strokeWidth={2} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/" className="text-sm font-medium text-body hover:text-brand-600">View store</Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white">
                {(user?.username || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight text-ink">{user?.username || 'Admin'}</p>
                <p className="text-xs capitalize text-muted">{user?.role || 'admin'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
