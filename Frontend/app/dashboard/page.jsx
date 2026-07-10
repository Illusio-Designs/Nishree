'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag02Icon,
  MoneyBag02Icon,
  PackageIcon,
  UserGroupIcon,
  Clock01Icon,
  ChartLineData01Icon,
  Store01Icon,
  Mail01Icon,
  UserMultiple02Icon,
  DeliveryTruck01Icon,
  ArrowRight01Icon,
} from 'hugeicons-react';
import StatCard from '@/components/admin/StatCard';
import StatusPill from '@/components/admin/StatusPill';
import DataTable from '@/components/admin/DataTable';
import Card from '@/components/ui/Card';
import { formatPrice } from '@/lib/format';
import {
  adminListOrders,
  adminListProducts,
  adminListUsers,
  adminListParties,
  adminListSalesmen,
  adminListEnquiries,
} from '@/lib/admin-api';

const sumAmt = (list) => list.reduce((s, o) => s + (Number(o.final_amount) || 0), 0);

export default function DashboardOverview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const [orders, products, users, parties, salesmen, enquiries] = await Promise.all([
        adminListOrders().catch(() => []),
        adminListProducts().catch(() => []),
        adminListUsers().catch(() => []),
        adminListParties().catch(() => []),
        adminListSalesmen().catch(() => []),
        adminListEnquiries().catch(() => []),
      ]);
      setData({ orders: Array.isArray(orders) ? orders : [], products, users, parties, salesmen, enquiries });
    })();
  }, []);

  if (!data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />)}
      </div>
    );
  }

  const { orders, products, users, parties, salesmen, enquiries } = data;
  const valid = orders.filter((o) => o.status !== 'cancelled');
  const revenue = sumAmt(valid);
  const d2c = valid.filter((o) => (o.channel || 'd2c') === 'd2c');
  const b2b = valid.filter((o) => o.channel === 'b2b');
  const d2cRev = sumAmt(d2c);
  const b2bRev = sumAmt(b2b);
  const aov = valid.length ? revenue / valid.length : 0;
  const pending = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  const newLeads = enquiries.filter((e) => e.status === 'new').length;

  const statusCounts = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => ({
    status: s,
    count: orders.filter((o) => o.status === s).length,
  }));

  const pct = (v) => (revenue > 0 ? Math.round((v / revenue) * 100) : 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Overview</h1>
        <p className="text-body">Key metrics across your D2C store and B2B operations.</p>
      </div>

      {/* KPI grid — 3 cards per row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={MoneyBag02Icon} label="Total revenue" value={formatPrice(revenue)} hint={`${valid.length} orders`} tone="success" />
        <StatCard icon={ShoppingBag02Icon} label="Orders" value={orders.length} hint={`${pending} in progress`} />
        <StatCard icon={ChartLineData01Icon} label="Avg. order value" value={formatPrice(aov)} tone="ink" />
        <StatCard icon={DeliveryTruck01Icon} label="B2B revenue" value={formatPrice(b2bRev)} hint={`${b2b.length} wholesale orders`} tone="success" />
        <StatCard icon={Clock01Icon} label="Pending fulfilment" value={pending} tone="warning" />
        <StatCard icon={Mail01Icon} label="New wholesale leads" value={newLeads} hint={`${enquiries.length} total`} tone="warning" />
        <StatCard icon={PackageIcon} label="Products" value={products.length} tone="ink" />
        <StatCard icon={UserGroupIcon} label="Customers" value={users.length} />
        <StatCard icon={Store01Icon} label="B2B parties" value={parties.length} tone="ink" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Channel split */}
        <Card className="p-6">
          <h2 className="mb-4 font-bold text-ink">Revenue by channel</h2>
          {[
            { label: 'D2C (retail)', val: d2cRev, cls: 'bg-brand-500' },
            { label: 'B2B (wholesale)', val: b2bRev, cls: 'bg-brand-700' },
          ].map((row) => (
            <div key={row.label} className="mb-4 last:mb-0">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-body">{row.label}</span>
                <span className="font-semibold text-ink">{formatPrice(row.val)} · {pct(row.val)}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-soft">
                <div className={`h-full rounded-full ${row.cls}`} style={{ width: `${pct(row.val)}%` }} />
              </div>
            </div>
          ))}
        </Card>

        {/* Order status breakdown */}
        <Card className="p-6">
          <h2 className="mb-4 font-bold text-ink">Orders by status</h2>
          <ul className="space-y-3">
            {statusCounts.map((s) => (
              <li key={s.status} className="flex items-center justify-between">
                <StatusPill status={s.status} />
                <span className="font-semibold text-ink">{s.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Quick links */}
        <Card className="p-6">
          <h2 className="mb-4 font-bold text-ink">Quick actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Add a product', href: '/dashboard/products' },
              { label: 'View orders', href: '/dashboard/orders' },
              { label: 'Wholesale leads', href: '/dashboard/wholesale' },
              { label: 'Publish a recipe', href: '/dashboard/blog' },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm font-medium text-body transition-colors hover:border-brand-300 hover:text-brand-600">
                {l.label}
                <ArrowRight01Icon size={16} strokeWidth={2} />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-bold text-ink">Recent orders</h2>
          <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            View all <ArrowRight01Icon size={15} strokeWidth={2} />
          </Link>
        </div>
        <DataTable
          emptyTitle="No orders yet"
          rows={orders.slice(0, 8)}
          columns={[
            { key: 'order_number', label: 'Order', render: (o) => <span className="font-semibold text-ink">{o.order_number || `#${o.id}`}</span> },
            { key: 'channel', label: 'Channel', render: (o) => <span className="text-xs font-semibold uppercase text-muted">{o.channel || 'd2c'}</span> },
            { key: 'customer', label: 'Customer', render: (o) => o.User?.username || o.Party?.shop_name || o.guest_name || '—' },
            { key: 'final_amount', label: 'Total', render: (o) => formatPrice(o.final_amount) },
            { key: 'status', label: 'Status', render: (o) => <StatusPill status={o.status} /> },
            { key: 'created_at', label: 'Date', render: (o) => (o.created_at ? new Date(o.created_at).toLocaleDateString() : '—') },
          ]}
        />
      </Card>
    </div>
  );
}
