'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  UserIcon,
  Mail01Icon,
  Call02Icon,
  PackageIcon,
  Location01Icon,
  FavouriteIcon,
  Logout01Icon,
  DashboardSquare01Icon,
} from 'hugeicons-react';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { getUser, clearSession, isLoggedIn } from '@/lib/auth';
import { getMyOrders, getMyAddresses } from '@/lib/api';
import { formatPrice, cn } from '@/lib/format';

// Sidebar tabs. Wishlist routes out; the rest switch the panel in-page.
const TABS = [
  { key: 'overview', icon: DashboardSquare01Icon, label: 'Overview' },
  { key: 'orders', icon: PackageIcon, label: 'My Orders' },
  { key: 'addresses', icon: Location01Icon, label: 'Addresses' },
  { key: 'wishlist', icon: FavouriteIcon, label: 'Wishlist', href: '/wishlist' },
];

const STATUS_TONE = {
  delivered: 'success',
  completed: 'success',
  shipped: 'brand',
  processing: 'brand',
  pending: 'neutral',
  cancelled: 'warning',
};

const fmtDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('overview');

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login?redirect=/profile');
      return;
    }
    setUser(getUser());
    setReady(true);

    getMyOrders()
      .then((list) => setOrders(Array.isArray(list) ? list : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));

    getMyAddresses()
      .then((list) => setAddresses(Array.isArray(list) ? list : []))
      .catch(() => setAddresses([]))
      .finally(() => setAddressesLoading(false));
  }, [router]);

  const onLogout = () => {
    clearSession();
    toast.info('Signed out');
    router.push('/');
  };

  if (!ready) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={32} />
      </div>
    );
  }

  const name = user?.username || user?.full_name || 'Nishree Customer';
  const email = user?.email || '—';

  const OrderRow = ({ o }) => (
    <li className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-semibold text-ink">{o.order_number || `#${o.id}`}</p>
        <p className="text-xs text-muted">{fmtDate(o.createdAt || o.created_at)}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge tone={STATUS_TONE[String(o.status || 'pending').toLowerCase()] || 'neutral'}>
          <span className="capitalize">{o.status || 'pending'}</span>
        </Badge>
        <span className="text-sm font-bold text-ink">
          {formatPrice(o.final_amount ?? o.total_amount ?? 0)}
        </span>
      </div>
    </li>
  );

  return (
    <>
      <PageHeader title="My Account" subtitle={`Welcome back, ${name}.`} crumbs={[{ label: 'Profile' }]} />
      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <Card className="h-max p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full brand-gradient text-2xl font-bold text-white">
                {name.charAt(0).toUpperCase()}
              </div>
              <p className="mt-3 font-bold text-ink">{name}</p>
              <p className="text-sm text-muted">{email}</p>
            </div>
            <nav className="mt-6 space-y-1">
              {TABS.map(({ key, icon: Icon, label, href }) => {
                const activeTab = !href && tab === key;
                return (
                  <button
                    key={key}
                    onClick={() => (href ? router.push(href) : setTab(key))}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer',
                      activeTab
                        ? 'bg-brand-50 text-brand-600'
                        : 'text-body hover:bg-surface-soft',
                    )}
                  >
                    <Icon size={18} strokeWidth={2} />
                    {label}
                  </button>
                );
              })}
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-red-50 cursor-pointer"
              >
                <Logout01Icon size={18} strokeWidth={2} />
                Sign out
              </button>
            </nav>
          </Card>

          {/* Content */}
          <div className="space-y-6">
            {/* Overview: profile details + recent orders */}
            {tab === 'overview' && (
              <>
                <Card className="p-6">
                  <h2 className="mb-4 text-lg font-bold text-ink">Profile details</h2>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    {[
                      { icon: UserIcon, label: 'Name', value: name },
                      { icon: Mail01Icon, label: 'Email', value: email },
                      { icon: Call02Icon, label: 'Phone', value: user?.phone || '—' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 rounded-2xl border border-line p-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                          <Icon size={18} strokeWidth={2} />
                        </span>
                        <div>
                          <dt className="text-xs text-muted">{label}</dt>
                          <dd className="text-sm font-semibold text-ink">{value}</dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </Card>

                <Card className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-ink">Recent orders</h2>
                    {orders.length > 0 && (
                      <button
                        onClick={() => setTab('orders')}
                        className="text-sm font-semibold text-brand-600 hover:underline cursor-pointer"
                      >
                        View all
                      </button>
                    )}
                  </div>
                  {ordersLoading ? (
                    <div className="flex justify-center py-6"><Spinner size={22} /></div>
                  ) : orders.length === 0 ? (
                    <>
                      <p className="text-sm text-body">You haven&apos;t placed any orders yet.</p>
                      <Button href="/products" className="mt-4">Start shopping</Button>
                    </>
                  ) : (
                    <ul className="divide-y divide-line">
                      {orders.slice(0, 5).map((o) => <OrderRow key={o.id} o={o} />)}
                    </ul>
                  )}
                </Card>
              </>
            )}

            {/* My Orders: full list */}
            {tab === 'orders' && (
              <Card className="p-6">
                <h2 className="mb-4 text-lg font-bold text-ink">My orders</h2>
                {ordersLoading ? (
                  <div className="flex justify-center py-6"><Spinner size={22} /></div>
                ) : orders.length === 0 ? (
                  <>
                    <p className="text-sm text-body">You haven&apos;t placed any orders yet.</p>
                    <Button href="/products" className="mt-4">Start shopping</Button>
                  </>
                ) : (
                  <ul className="divide-y divide-line">
                    {orders.map((o) => <OrderRow key={o.id} o={o} />)}
                  </ul>
                )}
              </Card>
            )}

            {/* Addresses */}
            {tab === 'addresses' && (
              <Card className="p-6">
                <h2 className="mb-4 text-lg font-bold text-ink">Saved addresses</h2>
                {addressesLoading ? (
                  <div className="flex justify-center py-6"><Spinner size={22} /></div>
                ) : addresses.length === 0 ? (
                  <p className="text-sm text-body">
                    You have no saved addresses yet. They&apos;ll appear here after you place an order.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((a) => (
                      <div key={a.id} className="rounded-2xl border border-line p-4">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-sm font-semibold text-ink">
                            {a.full_name || a.name || name}
                          </p>
                          {a.is_default && <Badge tone="brand">Default</Badge>}
                        </div>
                        <p className="text-sm text-body">
                          {[a.address_line1 || a.address, a.address_line2, a.city, a.state, a.postal_code || a.pincode]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                        {(a.phone || a.phone_number) && (
                          <p className="mt-1 text-xs text-muted">Phone: {a.phone || a.phone_number}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
