'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ViewIcon } from 'hugeicons-react';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import OrderDetailsDrawer from '@/components/admin/OrderDetailsDrawer';
import { formatPrice } from '@/lib/format';
import { adminListOrders, adminUpdateOrderStatus } from '@/lib/admin-api';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_LABEL = { cod: 'COD', prepaid: 'Prepaid', credit_card: 'Card', upi: 'UPI', wallet: 'Wallet' };

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewOrder, setViewOrder] = useState(null);

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
        actions={(o) => (
          <Button size="sm" variant="soft" icon={ViewIcon} onClick={() => setViewOrder(o)}>View</Button>
        )}
        columns={[
          { key: 'order_number', label: 'Order', render: (o) => <span className="font-semibold text-ink">{o.order_number || `#${o.id}`}</span> },
          { key: 'customer', label: 'Customer', render: (o) => o.User?.username || o.guest_name || o.Party?.shop_name || '—' },
          { key: 'channel', label: 'Channel', render: (o) => <span className="text-xs font-semibold uppercase text-muted">{o.channel || 'd2c'}</span> },
          { key: 'final_amount', label: 'Total', render: (o) => formatPrice(o.final_amount) },
          {
            key: 'payment', label: 'Payment', render: (o) => (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-ink">{PAYMENT_LABEL[o.payment_type] || o.payment_type || '—'}</span>
                <StatusPill status={o.payment_status} />
              </div>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (o) => (
              <div className="w-40">
                <Select value={o.status} onChange={(e) => changeStatus(o, e.target.value)} className="h-9 capitalize">
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
            ),
          },
          { key: 'created_at', label: 'Date', render: (o) => { const d = o.createdAt || o.created_at; return d ? new Date(d).toLocaleDateString() : '—'; } },
        ]}
      />

      <OrderDetailsDrawer order={viewOrder} open={!!viewOrder} onClose={() => setViewOrder(null)} />
    </div>
  );
}
