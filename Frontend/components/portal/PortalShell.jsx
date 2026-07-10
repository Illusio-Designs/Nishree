'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  DashboardSquare01Icon,
  Route02Icon,
  MapsLocation01Icon,
  Target02Icon,
  ChartLineData01Icon,
  ShoppingBag02Icon,
  UserIcon,
  Store01Icon,
  Menu01Icon,
  Cancel01Icon,
  Logout01Icon,
} from 'hugeicons-react';
import Logo from '@/components/ui/Logo';
import Spinner from '@/components/ui/Spinner';
import { getUser, clearSession, isLoggedIn } from '@/lib/auth';
import { cn } from '@/lib/format';

const NAV_BY_ROLE = {
  salesman: [
    { label: 'Home', href: '/portal', icon: DashboardSquare01Icon },
    { label: 'My Route', href: '/portal/route', icon: Route02Icon },
    { label: 'Journey', href: '/portal/journey', icon: MapsLocation01Icon },
    { label: 'Targets', href: '/portal/targets', icon: Target02Icon },
    { label: 'Performance', href: '/portal/report', icon: ChartLineData01Icon },
    { label: 'My Orders', href: '/portal/orders', icon: ShoppingBag02Icon },
    { label: 'Profile', href: '/portal/profile', icon: UserIcon },
  ],
  party: [
    { label: 'Home', href: '/portal', icon: DashboardSquare01Icon },
    { label: 'My Orders', href: '/portal/orders', icon: ShoppingBag02Icon },
    { label: 'Profile', href: '/portal/profile', icon: UserIcon },
  ],
  distributor: [
    { label: 'Home', href: '/portal', icon: DashboardSquare01Icon },
    { label: 'My Parties', href: '/portal/parties', icon: Store01Icon },
    { label: 'My Orders', href: '/portal/orders', icon: ShoppingBag02Icon },
    { label: 'Profile', href: '/portal/profile', icon: UserIcon },
  ],
};

const ROLE_LABEL = { salesman: 'Field Sales', party: 'Retail Partner', distributor: 'Distributor' };

export default function PortalShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login/business?redirect=/portal');
      return;
    }
    setUser(getUser());
    setReady(true);
  }, [router]);

  if (!ready) return <div className="flex min-h-screen items-center justify-center"><Spinner size={32} /></div>;

  const role = user?.role || 'party';
  const nav = NAV_BY_ROLE[role] || NAV_BY_ROLE.party;
  const isActive = (href) => (href === '/portal' ? pathname === '/portal' : pathname.startsWith(href));

  const onLogout = () => { clearSession(); router.push('/'); };

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-line px-5"><Logo /></div>
      <nav className="flex-1 overflow-y-auto p-3">
        {nav.map(({ label, href, icon: Icon }) => (
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
      </nav>
      <button onClick={onLogout} className="m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger hover:bg-red-50 cursor-pointer">
        <Logout01Icon size={19} strokeWidth={2} /> Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-soft">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-white lg:block">{Sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-pop">{Sidebar}</aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} aria-label="Menu" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-soft lg:hidden cursor-pointer">
            <Menu01Icon size={22} strokeWidth={2} />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white">
              {(user?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight text-ink">{user?.username || 'User'}</p>
              <p className="text-xs text-muted">{ROLE_LABEL[role] || 'Partner'}</p>
            </div>
          </div>
        </header>
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
