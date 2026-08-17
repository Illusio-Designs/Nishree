'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Add01Icon } from 'hugeicons-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { formatPrice } from '@/lib/format';
import { getMyExpenses, createExpense } from '@/lib/portal-api';

const STATUS_TONE = { approved: 'success', pending: 'warning', rejected: 'neutral' };
const fmtDate = (v) => (v ? String(v).slice(0, 10) : '—');
const today = () => new Date().toISOString().slice(0, 10);

const CATEGORIES = ['Travel', 'Fuel', 'Food', 'Stay', 'Other'];

export default function ExpensesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ amount: '', category: 'Travel', expense_date: '', description: '' });
  const [receipt, setReceipt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setRows(await getMyExpenses());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount.');
    setBusy(true);
    try {
      await createExpense({ ...form, expense_date: form.expense_date || today(), receipt });
      toast.success('Expense submitted for approval');
      setForm({ amount: '', category: 'Travel', expense_date: '', description: '' });
      setReceipt(null);
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not submit expense');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Expenses</h1>
          <p className="text-body">Log field expenses for your manager to approve.</p>
        </div>
        {!open && <Button icon={Add01Icon} onClick={() => setOpen(true)}>Log expense</Button>}
      </div>

      {open && (
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-lg font-bold text-ink">New expense</h2>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Input label="Amount (₹)" name="amount" type="number" value={form.amount} onChange={onChange} required />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
              <select name="category" value={form.category} onChange={onChange}
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink focus-ring">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Date" name="expense_date" type="date" value={form.expense_date} onChange={onChange} placeholder={today()} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Receipt (optional)</label>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                className="block w-full text-sm text-body file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-ink">Notes</label>
              <textarea name="description" value={form.description} onChange={onChange} rows={2}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink focus-ring" />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit expense'}</Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={30} /></div>
      ) : rows.length === 0 ? (
        <EmptyState title="No expenses yet" message="Log your first field expense above." />
      ) : (
        <div className="space-y-3">
          {rows.map((e) => (
            <Card key={e.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-ink">{formatPrice(e.amount)} <span className="text-sm font-normal text-muted">· {e.category || 'Expense'}</span></p>
                <p className="text-xs text-muted">{fmtDate(e.expense_date)}{e.description ? ` · ${e.description}` : ''}</p>
              </div>
              <Badge tone={STATUS_TONE[e.status] || 'neutral'}><span className="capitalize">{e.status}</span></Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
