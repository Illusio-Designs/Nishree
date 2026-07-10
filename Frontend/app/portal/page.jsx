'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Route02Icon, Target02Icon, ShoppingBag02Icon, ArrowRight01Icon, Store01Icon, Wallet01Icon } from 'hugeicons-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusPill from '@/components/admin/StatusPill';
import Spinner from '@/components/ui/Spinner';
import { getUser } from '@/lib/auth';
import { formatPrice } from '@/lib/format';
import { getMyRoute, getTargetAchievement, getMyB2BOrders, getMyParty, getMyDistributor, getDistributorParties } from '@/lib/portal-api';

export default function PortalHome() {
  const [role, setRole] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const u = getUser();
    const r = u?.role || 'party';
    setRole(r);
    (async () => {
      if (r === 'salesman') {
        const [route, ach] = await Promise.all([getMyRoute().catch(() => null), getTargetAchievement().catch(() => null)]);
        setData({ route, ach });
      } else if (r === 'distributor') {
        const dist = await getMyDistributor().catch(() => null);
        const [parties, orders] = await Promise.all([getDistributorParties(dist?.id).catch(() => []), getMyB2BOrders().catch(() => [])]);
        setData({ dist, parties, orders });
      } else {
        const [party, orders] = await Promise.all([getMyParty().catch(() => null), getMyB2BOrders().catch(() => [])]);
        setData({ party, orders });
      }
    })();
  }, []);

  if (!data) return <div className="flex justify-center py-24"><Spinner size={32} /></div>;
  const name = getUser()?.username || 'there';

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Welcome back, {name.split(' ')[0]} 👋</h1>
      <p className="text-body">{role === 'salesman' ? 'Here is your day at a glance.' : 'Here is your account at a glance.'}</p>

      {role === 'salesman' && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm text-muted"><Route02Icon size={16} strokeWidth={2} /> Route progress</div>
              <p className="mt-1 text-2xl font-bold text-ink">{data.route?.summary?.visited ?? 0}/{data.route?.summary?.total ?? 0}</p>
              <p className="text-xs text-muted">stops visited</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm text-muted"><Target02Icon size={16} strokeWidth={2} /> Target achieved</div>
              <p className="mt-1 text-2xl font-bold text-ink">{data.ach?.summary?.overall_percent ?? 0}%</p>
              <p className="text-xs text-muted">{formatPrice(data.ach?.summary?.total_achieved || 0)} of {formatPrice(data.ach?.summary?.total_target || 0)}</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm text-muted"><Store01Icon size={16} strokeWidth={2} /> Pending stops</div>
              <p className="mt-1 text-2xl font-bold text-ink">{data.route?.summary?.pending ?? 0}</p>
              <p className="text-xs text-muted">left to visit</p>
            </Card>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/portal/route" icon={Route02Icon}>Start today&apos;s route</Button>
            <Button href="/portal/journey" variant="secondary">Track journey</Button>
            <Button href="/portal/report" variant="secondary">My performance</Button>
          </div>
        </>
      )}

      {role !== 'salesman' && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm text-muted"><ShoppingBag02Icon size={16} strokeWidth={2} /> Orders</div>
              <p className="mt-1 text-2xl font-bold text-ink">{(data.orders || []).length}</p>
            </Card>
            {role === 'distributor' ? (
              <Card className="p-5">
                <div className="flex items-center gap-2 text-sm text-muted"><Store01Icon size={16} strokeWidth={2} /> My parties</div>
                <p className="mt-1 text-2xl font-bold text-ink">{(data.parties || []).length}</p>
              </Card>
            ) : (
              <Card className="p-5">
                <div className="flex items-center gap-2 text-sm text-muted"><Wallet01Icon size={16} strokeWidth={2} /> Credit limit</div>
                <p className="mt-1 text-2xl font-bold text-ink">{formatPrice(data.party?.credit_limit || 0)}</p>
                <p className="text-xs text-muted">{data.party?.credit_days || 0} days terms</p>
              </Card>
            )}
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm text-muted">Spend</div>
              <p className="mt-1 text-2xl font-bold text-ink">{formatPrice((data.orders || []).reduce((a, o) => a + (Number(o.final_amount) || 0), 0))}</p>
            </Card>
          </div>

          <Card className="mt-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-bold text-ink">Recent orders</h2>
              <Link href="/portal/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">View all <ArrowRight01Icon size={15} strokeWidth={2} /></Link>
            </div>
            <ul className="divide-y divide-line">
              {(data.orders || []).slice(0, 5).map((o) => (
                <li key={o.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-semibold text-ink">{o.order_number}</p>
                    <p className="text-xs text-muted">{o.created_at ? new Date(o.created_at).toLocaleDateString() : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-ink">{formatPrice(o.final_amount)}</span>
                    <StatusPill status={o.status} />
                  </div>
                </li>
              ))}
              {(data.orders || []).length === 0 && <li className="px-5 py-6 text-center text-muted">No orders yet.</li>}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
