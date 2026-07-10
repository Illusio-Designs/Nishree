'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import Button from '@/components/ui/Button';
import { adminListSalesmen, adminSetSalesmanStatus, adminDeleteSalesman } from '@/lib/admin-api';

export default function SalesmenPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminListSalesmen()
      .then((s) => setRows(Array.isArray(s) ? s : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggle = async (s) => {
    const next = s.status === 'active' ? 'inactive' : 'active';
    try {
      await adminSetSalesmanStatus(s.id, next);
      setRows((prev) => prev.map((r) => (r.id === s.id ? { ...r, status: next } : r)));
      toast.success(`Salesman marked ${next}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  const remove = async (s) => {
    if (!window.confirm('Delete this salesman?')) return;
    try {
      await adminDeleteSalesman(s.id);
      setRows((prev) => prev.filter((r) => r.id !== s.id));
      toast.success('Deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Salesmen</h1>
        <p className="text-body">Field sales reps, territory and status.</p>
      </div>
      <DataTable
        loading={loading}
        emptyTitle="No salesmen yet"
        rows={rows}
        onDelete={remove}
        actions={(s) => (
          <Button size="sm" variant={s.status === 'active' ? 'secondary' : 'soft'} onClick={() => toggle(s)}>
            {s.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        )}
        columns={[
          { key: 'name', label: 'Name', render: (s) => <span className="font-semibold text-ink">{s.name}</span> },
          { key: 'phone', label: 'Phone', render: (s) => s.phone || '—' },
          { key: 'email', label: 'Email', render: (s) => s.email || '—' },
          { key: 'state', label: 'State', render: (s) => s.state || '—' },
          { key: 'status', label: 'Status', render: (s) => <StatusPill status={s.status} /> },
        ]}
      />
    </div>
  );
}
