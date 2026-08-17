'use client';

import { useEffect, useState } from 'react';
import { Add01Icon } from 'hugeicons-react';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/format';
import { getMyB2BOrders } from '@/lib/portal-api';
import { getUser } from '@/lib/auth';

export default function PortalOrders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const isSalesman = getUser()?.role === 'salesman';

  useEffect(() => {
    getMyB2BOrders().then((o) => setRows(Array.isArray(o) ? o : [])).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Orders</h1>
          <p className="text-body">Your wholesale orders and their status.</p>
        </div>
        {isSalesman && <Button href="/portal/orders/new" icon={Add01Icon}>New order</Button>}
      </div>
      <DataTable
        loading={loading}
        emptyTitle="No orders yet"
        rows={rows}
        columns={[
          { key: 'order_number', label: 'Order', render: (o) => <span className="font-semibold text-ink">{o.order_number || `#${o.id}`}</span> },
          { key: 'order_type', label: 'Type', render: (o) => <Badge tone="soft">{(o.order_type || 'order').replace(/_/g, ' ')}</Badge> },
          { key: 'final_amount', label: 'Total', render: (o) => formatPrice(o.final_amount) },
          { key: 'status', label: 'Status', render: (o) => <StatusPill status={o.status} /> },
          { key: 'created_at', label: 'Date', render: (o) => (o.created_at ? new Date(o.created_at).toLocaleDateString() : '—') },
        ]}
      />
    </div>
  );
}
