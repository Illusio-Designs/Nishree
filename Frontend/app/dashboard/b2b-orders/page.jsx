'use client';

import { useEffect, useState } from 'react';
import { Download04Icon } from 'hugeicons-react';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/format';
import { adminListB2BOrders } from '@/lib/admin-api';
import { downloadOrderPdf } from '@/lib/orderPdf';

export default function B2BOrdersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminListB2BOrders()
      .then((o) => setRows(Array.isArray(o) ? o : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

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
          { key: 'status', label: 'Status', render: (o) => <StatusPill status={o.status} /> },
          { key: 'created_at', label: 'Date', render: (o) => (o.created_at ? new Date(o.created_at).toLocaleDateString() : '—') },
        ]}
      />
    </div>
  );
}
