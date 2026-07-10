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
  ArrowLeft01Icon,
  ArrowRight01Icon,
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

const STORAGE_KEY = 'nishree_sidebar_collapsed';

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [open, setOpen] = useState(false);        // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop collapse
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login?redirect=/dashboard');
      return;
    }
    setUser(getUser());
    const u = getUser();
    const role = u?.role || '';
    setAllowed(role === 'admin' || role.endsWith('_manager'));
    setCollapsed(localStorage.getItem(STORAGE_KEY) === 'true');
    setReady(true);
  }, [router]);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      localStorage.setItem(STORAGE_KEY, String(!c));
      return !c;
    });
  };

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

  // `mini` renders the collapsed icon-only sidebar with hover tooltips.
  const renderSidebar = (mini) => (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 items-center border-b border-line', mini ? 'justify-center px-2' : 'px-5')}>
        <Logo compact={mini} />
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {NAV.map((group) => (
          <div key={group.section} className="mb-4">
            {!mini && <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-muted">{group.section}</p>}
            {mini && <div className="mx-2 mb-2 border-t border-line" />}
            {group.items.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                title={mini ? label : undefined}
                className={cn(
                  'flex items-center rounded-xl text-sm font-medium transition-colors',
                  mini ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                  isActive(href) ? 'bg-brand-50 text-brand-700' : 'text-body hover:bg-surface-soft',
                )}
              >
                <Icon size={19} strokeWidth={2} />
                {!mini && label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <button
        onClick={onLogout}
        title={mini ? 'Sign out' : undefined}
        className={cn(
          'm-3 flex items-center rounded-xl py-2.5 text-sm font-medium text-danger transition-colors hover:bg-red-50 cursor-pointer',
          mini ? 'justify-center' : 'gap-3 px-3',
        )}
      >
        <Logout01Icon size={19} strokeWidth={2} />
        {!mini && 'Sign out'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-soft">
      {/* Desktop sidebar */}
      <aside className={cn('fixed inset-y-0 left-0 z-40 hidden border-r border-line bg-white transition-[width] duration-200 lg:block', collapsed ? 'w-20' : 'w-64')}>
        {renderSidebar(collapsed)}
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-pop">{renderSidebar(false)}</aside>
        </div>
      )}

      <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-20' : 'lg:pl-64')}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} aria-label="Menu" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-soft lg:hidden cursor-pointer">
            <Menu01Icon size={22} strokeWidth={2} />
          </button>
          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-body hover:bg-surface-soft lg:flex cursor-pointer"
          >
            {collapsed ? <ArrowRight01Icon size={20} strokeWidth={2} /> : <ArrowLeft01Icon size={20} strokeWidth={2} />}
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

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
