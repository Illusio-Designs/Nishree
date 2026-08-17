'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Download04Icon } from 'hugeicons-react';
import DataTable from '@/components/admin/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/format';
import { adminListB2BOrders, adminUpdateB2BOrderStatus } from '@/lib/admin-api';
import { downloadOrderPdf } from '@/lib/orderPdf';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function B2BOrdersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    adminListB2BOrders()
      .then((o) => setRows(Array.isArray(o) ? o : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (order, status) => {
    setSavingId(order.id);
    try {
      await adminUpdateB2BOrderStatus(order.id, status);
      setRows((prev) => prev.map((r) => (r.id === order.id ? { ...r, status } : r)));
      toast.success(`Order marked ${status}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update status');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">B2B Orders</h1>
        <p className="text-body">Wholesale orders across parties, distributors and events.</p>
      </div>
      <DataTable
        loading={loading}
        emptyTitle="No B2B orders yet"
        rows={rows}
        actions={(o) => (
          <Button size="sm" variant="secondary" icon={Download04Icon} onClick={() => downloadOrderPdf(o)}>
            PDF
          </Button>
        )}
        columns={[
          { key: 'order_number', label: 'Order', render: (o) => <span className="font-semibold text-ink">{o.order_number || `#${o.id}`}</span> },
          { key: 'order_type', label: 'Type', render: (o) => <Badge tone="soft">{(o.order_type || '').replace(/_/g, ' ')}</Badge> },
          { key: 'party', label: 'Buyer', render: (o) => o.Party?.shop_name || o.Distributor?.name || '—' },
          { key: 'salesman', label: 'Salesman', render: (o) => o.Salesman?.name || '—' },
          { key: 'final_amount', label: 'Total', render: (o) => formatPrice(o.final_amount) },
          {
            key: 'status', label: 'Status', render: (o) => (
              <select
                value={o.status || 'pending'}
                disabled={savingId === o.id}
                onChange={(e) => changeStatus(o, e.target.value)}
                className="h-9 rounded-lg border border-line bg-white px-2 text-sm font-medium capitalize text-ink focus-ring disabled:opacity-60"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ),
          },
          { key: 'created_at', label: 'Date', render: (o) => (o.created_at ? new Date(o.created_at).toLocaleDateString() : '—') },
        ]}
      />
    </div>
  );
}
