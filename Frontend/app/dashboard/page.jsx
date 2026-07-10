'use client';

import { useEffect, useState } from 'react';
import {
  ShoppingBag02Icon,
  MoneyBag02Icon,
  PackageIcon,
  UserGroupIcon,
  ArrowRight01Icon,
} from 'hugeicons-react';
import Link from 'next/link';
import StatCard from '@/components/admin/StatCard';
import StatusPill from '@/components/admin/StatusPill';
import DataTable from '@/components/admin/DataTable';
import Card from '@/components/ui/Card';
import { formatPrice } from '@/lib/format';
import {
  adminListOrders,
  adminListProducts,
  adminListUsers,
} from '@/lib/admin-api';

export default function DashboardOverview() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ord, prods, users] = await Promise.all([
          adminListOrders().catch(() => []),
          adminListProducts().catch(() => []),
          adminListUsers().catch(() => []),
        ]);
        const orderList = Array.isArray(ord) ? ord : [];
        setOrders(orderList.slice(0, 8));
        setStats({
          revenue: orderList.reduce((s, o) => s + (Number(o.final_amount) || 0), 0),
          orders: orderList.length,
          products: Array.isArray(prods) ? prods.length : 0,
          customers: Array.isArray(users) ? users.length : 0,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Overview</h1>
        <p className="text-body">A snapshot of your store performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={MoneyBag02Icon} label="Total revenue" value={formatPrice(stats.revenue)} tone="success" />
        <StatCard icon={ShoppingBag02Icon} label="Orders" value={stats.orders} />
        <StatCard icon={PackageIcon} label="Products" value={stats.products} tone="ink" />
        <StatCard icon={UserGroupIcon} label="Customers" value={stats.customers} tone="warning" />
      </div>

      <Card className="mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-bold text-ink">Recent orders</h2>
          <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            View all <ArrowRight01Icon size={15} strokeWidth={2} />
          </Link>
        </div>
        <DataTable
          loading={loading}
          emptyTitle="No orders yet"
          columns={[
            { key: 'order_number', label: 'Order', render: (o) => <span className="font-semibold text-ink">{o.order_number || `#${o.id}`}</span> },
            { key: 'channel', label: 'Channel', render: (o) => <span className="uppercase text-xs font-semibold">{o.channel || 'd2c'}</span> },
            { key: 'final_amount', label: 'Total', render: (o) => formatPrice(o.final_amount) },
            { key: 'status', label: 'Status', render: (o) => <StatusPill status={o.status} /> },
            { key: 'created_at', label: 'Date', render: (o) => (o.created_at ? new Date(o.created_at).toLocaleDateString() : '—') },
          ]}
          rows={orders}
        />
      </Card>
    </div>
  );
}
