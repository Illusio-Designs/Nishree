'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { CheckmarkCircle02Icon, CancelCircleIcon } from 'hugeicons-react';
import DataTable from '@/components/admin/DataTable';
import Badge from '@/components/ui/Badge';
import { mediaUrl } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { adminListExpenses, adminSetExpenseStatus, adminDeleteExpense } from '@/lib/admin-api';

const STATUS_TONE = { approved: 'success', pending: 'warning', rejected: 'neutral' };
const FILTERS = ['all', 'pending', 'approved', 'rejected'];
const fmtDate = (v) => (v ? String(v).slice(0, 10) : '—');
const salesmanName = (e) => e.Salesman?.name || e.salesman?.name || (e.salesman_id ? `#${e.salesman_id}` : '—');

export default function ExpensesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await adminListExpenses());
    } catch {
      setRows([]);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const moderate = async (id, status) => {
    try {
      await adminSetExpenseStatus(id, status);
      toast.success(`Expense ${status}`);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed');
    }
  };

  const remove = async (row) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await adminDeleteExpense(row.id);
      toast.success('Expense deleted');
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  const columns = [
    { key: 'salesman', label: 'Salesman', render: (e) => <span className="font-semibold text-ink">{salesmanName(e)}</span> },
    { key: 'category', label: 'Category', render: (e) => <span className="capitalize">{e.category || '—'}</span> },
    { key: 'amount', label: 'Amount', render: (e) => <span className="font-semibold text-ink">{formatPrice(e.amount)}</span> },
    { key: 'expense_date', label: 'Date', render: (e) => fmtDate(e.expense_date) },
    {
      key: 'receipt', label: 'Receipt', render: (e) => (
        e.receipt
          ? <a href={mediaUrl(e.receipt)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-600 hover:underline">View</a>
          : <span className="text-muted">—</span>
      ),
    },
    { key: 'status', label: 'Status', render: (e) => <Badge tone={STATUS_TONE[e.status] || 'neutral'}><span className="capitalize">{e.status}</span></Badge> },
  ];

  const actions = (e) => (
    <div className="flex items-center gap-1.5">
      {e.status !== 'approved' && (
        <button type="button" onClick={() => moderate(e.id, 'approved')} title="Approve"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer">
          <CheckmarkCircle02Icon size={18} strokeWidth={2} />
        </button>
      )}
      {e.status !== 'rejected' && (
        <button type="button" onClick={() => moderate(e.id, 'rejected')} title="Reject"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 cursor-pointer">
          <CancelCircleIcon size={18} strokeWidth={2} />
        </button>
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Salesman Expenses</h1>
          <p className="text-body">Review and approve field expense claims.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold capitalize transition-colors cursor-pointer ${
                filter === f ? 'bg-brand-600 text-white' : 'bg-surface-soft text-body hover:bg-brand-50'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} actions={actions} onDelete={remove} emptyTitle="No expenses found" />
    </div>
  );
}
