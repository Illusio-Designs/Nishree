'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import { formatPrice } from '@/lib/format';
import { adminListOrders, adminUpdateOrderStatus } from '@/lib/admin-api';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    adminListOrders()
      .then((o) => setOrders(Array.isArray(o) ? o : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const changeStatus = async (order, status) => {
    try {
      await adminUpdateOrderStatus(order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
      toast.success(`Order marked ${status}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update status');
    }
  };

  const rows = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Orders</h1>
          <p className="text-body">Track and update customer orders.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['all', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors cursor-pointer ${filter === s ? 'brand-gradient text-white' : 'bg-white text-body border border-line hover:border-brand-300'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        loading={loading}
        emptyTitle="No orders found"
        rows={rows}
        columns={[
          { key: 'order_number', label: 'Order', render: (o) => <span className="font-semibold text-ink">{o.order_number || `#${o.id}`}</span> },
          { key: 'customer', label: 'Customer', render: (o) => o.User?.username || o.guest_name || o.Party?.shop_name || '—' },
          { key: 'channel', label: 'Channel', render: (o) => <span className="text-xs font-semibold uppercase text-muted">{o.channel || 'd2c'}</span> },
          { key: 'final_amount', label: 'Total', render: (o) => formatPrice(o.final_amount) },
          { key: 'payment', label: 'Payment', render: (o) => <StatusPill status={o.payment_status} /> },
          {
            key: 'status',
            label: 'Status',
            render: (o) => (
              <select
                value={o.status}
                onChange={(e) => changeStatus(o, e.target.value)}
                className="h-9 rounded-full border border-line bg-white px-3 text-sm capitalize focus-ring cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ),
          },
          { key: 'created_at', label: 'Date', render: (o) => (o.created_at ? new Date(o.created_at).toLocaleDateString() : '—') },
        ]}
      />
    </div>
  );
}
