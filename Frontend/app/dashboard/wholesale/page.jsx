'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import { adminListEnquiries, adminSetEnquiryStatus, adminDeleteEnquiry } from '@/lib/admin-api';

const STATUSES = ['new', 'contacted', 'converted', 'closed'];

export default function WholesaleAdminPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    adminListEnquiries()
      .then((r) => setRows(Array.isArray(r) ? r : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const changeStatus = async (row, status) => {
    try {
      await adminSetEnquiryStatus(row.id, status);
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
      toast.success(`Marked ${status}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  const remove = async (row) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try {
      await adminDeleteEnquiry(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      toast.success('Deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  const visible = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Wholesale Enquiries</h1>
          <p className="text-body">Bulk / B2B pricing requests from the storefront.</p>
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
        emptyTitle="No enquiries yet"
        rows={visible}
        onDelete={remove}
        columns={[
          { key: 'business_name', label: 'Business', render: (r) => <span className="font-semibold text-ink">{r.business_name}</span> },
          { key: 'contact', label: 'Contact', render: (r) => <div><p className="text-ink">{r.contact_person || '—'}</p><p className="text-xs text-muted">{r.phone}</p></div> },
          { key: 'city', label: 'Location', render: (r) => [r.city, r.state].filter(Boolean).join(', ') || '—' },
          { key: 'product_interest', label: 'Interest', render: (r) => <div><p className="clamp-1">{r.product_interest || '—'}</p><p className="text-xs text-muted">{r.quantity_estimate || ''}</p></div> },
          {
            key: 'status',
            label: 'Status',
            render: (r) => (
              <select
                value={r.status}
                onChange={(e) => changeStatus(r, e.target.value)}
                className="h-9 rounded-full border border-line bg-white px-3 text-sm capitalize focus-ring cursor-pointer"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ),
          },
          { key: 'created_at', label: 'Date', render: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : '—') },
        ]}
      />
    </div>
  );
}
