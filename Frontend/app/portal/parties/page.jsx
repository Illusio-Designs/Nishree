'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import { getMyDistributor, getDistributorParties } from '@/lib/portal-api';

export default function PortalParties() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const dist = await getMyDistributor().catch(() => null);
      const parties = await getDistributorParties(dist?.id).catch(() => []);
      setRows(Array.isArray(parties) ? parties : []);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">My Parties</h1>
        <p className="text-body">Retail shops routed through your distribution.</p>
      </div>
      <DataTable
        loading={loading}
        emptyTitle="No parties yet"
        rows={rows}
        columns={[
          { key: 'shop_name', label: 'Shop', render: (p) => <span className="font-semibold text-ink">{p.shop_name}</span> },
          { key: 'contact_person', label: 'Contact', render: (p) => p.contact_person || '—' },
          { key: 'phone', label: 'Phone', render: (p) => p.phone || '—' },
          { key: 'city', label: 'City', render: (p) => p.city || '—' },
          { key: 'status', label: 'Status', render: (p) => <StatusPill status={p.status || 'active'} /> },
        ]}
      />
    </div>
  );
}
