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
  Logout01Icon,
  DashboardSquare01Icon,
  Add01Icon,
  PencilEdit02Icon,
  Delete02Icon,
} from 'hugeicons-react';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import AddressForm from '@/components/store/AddressForm';
import { getUser, clearSession, isLoggedIn } from '@/lib/auth';
import { getMyOrders, getMyAddresses, deleteShippingAddress, setDefaultShippingAddress, mediaUrl } from '@/lib/api';
import { formatPrice, cn, firstImage, variationLabel } from '@/lib/format';

// Sidebar tabs — all switch the panel in-page.
const TABS = [
  { key: 'overview', icon: DashboardSquare01Icon, label: 'Overview' },
  { key: 'orders', icon: PackageIcon, label: 'My Orders' },
  { key: 'addresses', icon: Location01Icon, label: 'Addresses' },
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
  const [addingAddress, setAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const loadAddresses = () =>
    getMyAddresses()
      .then((list) => setAddresses(Array.isArray(list) ? list : []))
      .catch(() => setAddresses([]))
      .finally(() => setAddressesLoading(false));

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

    loadAddresses();
  }, [router]);

  const removeAddress = async (a) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await deleteShippingAddress(a.id);
      setAddresses((prev) => prev.filter((x) => x.id !== a.id));
      toast.success('Address deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not delete address');
    }
  };

  const makeDefault = async (a) => {
    try {
      await setDefaultShippingAddress(a.id);
      setAddresses((prev) => prev.map((x) => ({ ...x, is_default: x.id === a.id })));
      toast.success('Default address updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not set default');
    }
  };

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

  const StatusBadge = ({ status }) => (
    <Badge tone={STATUS_TONE[String(status || 'pending').toLowerCase()] || 'neutral'}>
      <span className="capitalize">{status || 'pending'}</span>
    </Badge>
  );

  // Compact row for the Overview panel.
  const OrderRow = ({ o }) => (
    <li className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-semibold text-ink">{o.order_number || `#${o.id}`}</p>
        <p className="text-xs text-muted">{fmtDate(o.createdAt || o.created_at)}</p>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={o.status} />
        <span className="text-sm font-bold text-ink">
          {formatPrice(o.final_amount ?? o.total_amount ?? 0)}
        </span>
      </div>
    </li>
  );

  // Full card with line items for the My Orders panel.
  const OrderCard = ({ o }) => {
    const lines = o.OrderItems || o.items || [];
    return (
      <div className="rounded-2xl border border-line p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">{o.order_number || `#${o.id}`}</p>
            <p className="text-xs text-muted">{fmtDate(o.createdAt || o.created_at)}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={o.status} />
            <span className="text-sm font-bold text-ink">
              {formatPrice(o.final_amount ?? o.total_amount ?? 0)}
            </span>
          </div>
        </div>

        {lines.length > 0 && (
          <ul className="mt-3 divide-y divide-line border-t border-line">
            {lines.map((it) => {
              const img = mediaUrl(firstImage(it.Product) || it.image);
              const vlabel = variationLabel(it.Variation || it.ProductVariation);
              const qty = it.quantity ?? it.qty ?? 1;
              const price = Number(it.price) || 0;
              return (
                <li key={it.id} className="flex items-center gap-3 py-2.5">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-soft">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="clamp-1 text-sm font-medium text-ink">{it.Product?.name || 'Product'}</p>
                    <p className="text-xs text-muted">
                      {vlabel ? `${vlabel} · ` : ''}Qty {qty} × {formatPrice(price)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-ink">{formatPrice(price * qty)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

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

            {/* My Orders: full list with line items */}
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
                  <div className="space-y-4">
                    {orders.map((o) => <OrderCard key={o.id} o={o} />)}
                  </div>
                )}
              </Card>
            )}

            {/* Addresses */}
            {tab === 'addresses' && (
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-ink">Saved addresses</h2>
                  {!addingAddress && !editingAddress && (
                    <Button size="sm" icon={Add01Icon} onClick={() => setAddingAddress(true)}>
                      Add address
                    </Button>
                  )}
                </div>

                {(addingAddress || editingAddress) && (
                  <div className="mb-6 rounded-2xl border border-line p-4">
                    <h3 className="mb-3 text-sm font-bold text-ink">{editingAddress ? 'Edit address' : 'New address'}</h3>
                    <AddressForm
                      address={editingAddress || undefined}
                      onSaved={() => { setAddingAddress(false); setEditingAddress(null); loadAddresses(); }}
                      onCancel={() => { setAddingAddress(false); setEditingAddress(null); }}
                    />
                  </div>
                )}

                {addressesLoading ? (
                  <div className="flex justify-center py-6"><Spinner size={22} /></div>
                ) : addresses.length === 0 ? (
                  !addingAddress && (
                    <p className="text-sm text-body">
                      You have no saved addresses yet. Add one to speed up checkout.
                    </p>
                  )
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((a) => (
                      <div key={a.id} className="flex flex-col rounded-2xl border border-line p-4">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-sm font-semibold text-ink">{name}</p>
                          {a.is_default && <Badge tone="brand">Default</Badge>}
                        </div>
                        <p className="text-sm text-body">
                          {[a.address, a.city, a.state, a.postal_code, a.country]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                        {a.phone_number && (
                          <p className="mt-1 text-xs text-muted">Phone: {a.phone_number}</p>
                        )}
                        <div className="mt-3 flex items-center gap-3 border-t border-line pt-3 text-xs font-semibold">
                          {!a.is_default && (
                            <button type="button" onClick={() => makeDefault(a)} className="text-brand-600 hover:underline cursor-pointer">
                              Set default
                            </button>
                          )}
                          <button type="button" onClick={() => { setEditingAddress(a); setAddingAddress(false); }} className="inline-flex items-center gap-1 text-body hover:text-brand-600 cursor-pointer">
                            <PencilEdit02Icon size={14} strokeWidth={2} /> Edit
                          </button>
                          <button type="button" onClick={() => removeAddress(a)} className="ml-auto inline-flex items-center gap-1 text-danger hover:underline cursor-pointer">
                            <Delete02Icon size={14} strokeWidth={2} /> Delete
                          </button>
                        </div>
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
