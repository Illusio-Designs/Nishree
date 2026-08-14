'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { CheckmarkCircle02Icon, CancelCircleIcon } from 'hugeicons-react';
import DataTable from '@/components/admin/DataTable';
import Rating from '@/components/ui/Rating';
import Badge from '@/components/ui/Badge';
import { adminListReviews, adminModerateReview, adminDeleteReview } from '@/lib/admin-api';

const STATUS_TONE = { approved: 'success', pending: 'warning', rejected: 'neutral' };
const FILTERS = ['all', 'pending', 'approved', 'rejected'];

export default function ReviewsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminListReviews();
      setRows(Array.isArray(list) ? list : []);
    } catch {
      setRows([]);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const moderate = async (id, status) => {
    try {
      await adminModerateReview(id, status);
      toast.success(`Review ${status}`);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed');
    }
  };

  const remove = async (row) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await adminDeleteReview(row.id);
      toast.success('Review deleted');
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  const columns = [
    { key: 'productName', label: 'Product', render: (r) => <span className="font-semibold text-ink">{r.productName || r.Product?.name || '—'}</span> },
    { key: 'customerName', label: 'Customer', render: (r) => r.customerName || r.guestName || 'Guest' },
    { key: 'rating', label: 'Rating', render: (r) => <Rating value={r.rating} /> },
    { key: 'review', label: 'Review', render: (r) => <span className="clamp-2 max-w-xs text-body">{r.review || '—'}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status] || 'neutral'}><span className="capitalize">{r.status}</span></Badge> },
  ];

  const actions = (r) => (
    <div className="flex items-center gap-1.5">
      {r.status !== 'approved' && (
        <button
          type="button"
          onClick={() => moderate(r.id, 'approved')}
          title="Approve"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"
        >
          <CheckmarkCircle02Icon size={18} strokeWidth={2} />
        </button>
      )}
      {r.status !== 'rejected' && (
        <button
          type="button"
          onClick={() => moderate(r.id, 'rejected')}
          title="Reject"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 cursor-pointer"
        >
          <CancelCircleIcon size={18} strokeWidth={2} />
        </button>
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Reviews</h1>
          <p className="text-body">Approve, reject or remove customer reviews.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold capitalize transition-colors cursor-pointer ${
                filter === f ? 'bg-brand-600 text-white' : 'bg-surface-soft text-body hover:bg-brand-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        actions={actions}
        onDelete={remove}
        emptyTitle="No reviews found"
      />
    </div>
  );
}
