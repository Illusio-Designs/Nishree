'use client';

import { useEffect, useState } from 'react';
import { Location01Icon, ShoppingBag02Icon, Route02Icon, Target02Icon, Store01Icon, MoneyBag02Icon } from 'hugeicons-react';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { formatPrice } from '@/lib/format';
import { getVisitReport, getTargetAchievement } from '@/lib/portal-api';
import { PERFORMANCE } from '@/lib/portal-mock';

export default function ReportPage() {
  const [report, setReport] = useState(null);
  const [ach, setAch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getVisitReport().catch(() => null), getTargetAchievement().catch(() => null)])
      .then(([r, a]) => { setReport(r); setAch(a); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>;

  const rows = report?.rows || [];
  const orders = rows.filter((r) => r.type === 'Order');
  const visits = rows.filter((r) => r.type === 'Visit');
  const revenue = orders.reduce((a, o) => a + (Number(o.amount) || 0), 0);

  const kpis = [
    { icon: Location01Icon, label: 'Visits', value: visits.length || PERFORMANCE.visits },
    { icon: ShoppingBag02Icon, label: 'Orders', value: orders.length || PERFORMANCE.orders },
    { icon: MoneyBag02Icon, label: 'Order value', value: formatPrice(revenue || PERFORMANCE.revenue) },
    { icon: Target02Icon, label: 'Target', value: `${ach?.summary?.overall_percent ?? PERFORMANCE.target_percent}%` },
    { icon: Route02Icon, label: 'Distance', value: `${PERFORMANCE.distance_km} km` },
    { icon: Store01Icon, label: 'New parties', value: PERFORMANCE.new_parties },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">My Performance</h1>
        <p className="text-body">Your field activity and results.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted"><k.icon size={16} strokeWidth={2} /> {k.label}</div>
            <p className="mt-1 text-2xl font-bold text-ink">{k.value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 py-4"><h2 className="font-bold text-ink">Visit report</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-soft text-left">
                {['Type', 'Date', 'Party', 'Qty', 'Amount', 'Location match'].map((h) => <th key={h} className="px-4 py-3 font-semibold text-ink">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="px-4 py-3"><Badge tone={r.type === 'Order' ? 'brand' : 'soft'}>{r.type}</Badge></td>
                  <td className="px-4 py-3 text-body">{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-ink">{r.party || '—'}</td>
                  <td className="px-4 py-3 text-body">{r.qty ?? '—'}</td>
                  <td className="px-4 py-3 text-body">{r.amount != null ? formatPrice(r.amount) : '—'}</td>
                  <td className="px-4 py-3">
                    {r.match_percent != null ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-soft">
                          <span className="block h-full rounded-full" style={{ width: `${r.match_percent}%`, background: r.match_percent >= 70 ? 'var(--color-success)' : r.match_percent >= 40 ? 'var(--color-warning)' : 'var(--color-danger)' }} />
                        </span>
                        <span className="text-xs text-muted">{r.match_percent}%</span>
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">No activity recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
