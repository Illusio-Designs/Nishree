'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { formatPrice } from '@/lib/format';
import { getTargetAchievement } from '@/lib/portal-api';

export default function TargetsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTargetAchievement().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>;
  const rows = data?.rows || [];
  const sum = data?.summary || {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">My Targets</h1>
        <p className="text-body">Sales targets assigned to you and your progress.</p>
      </div>

      <Card className="mb-6 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Overall achievement</p>
            <p className="text-3xl font-extrabold text-brand-600">{sum.overall_percent ?? 0}%</p>
            <p className="text-sm text-body">{formatPrice(sum.total_achieved || 0)} of {formatPrice(sum.total_target || 0)}</p>
          </div>
        </div>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-surface-soft">
          <div className="h-full brand-gradient" style={{ width: `${Math.min(100, sum.overall_percent || 0)}%` }} />
        </div>
      </Card>

      {rows.length ? (
        <div className="space-y-4">
          {rows.map((t) => {
            const pct = Math.min(100, t.percent || 0);
            return (
              <Card key={t.target_id} className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-ink">{t.description || 'Sales target'}</p>
                    <p className="text-xs text-muted">{t.start_date} → {t.end_date}</p>
                  </div>
                  <span className="text-sm font-bold text-brand-600">{t.percent || 0}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-soft">
                  <div className="h-full rounded-full brand-gradient" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-sm text-body">{formatPrice(t.achieved || 0)} achieved of {formatPrice(t.target_amount || 0)}</p>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No targets assigned yet" message="Your manager will set targets for you here." />
      )}
    </div>
  );
}
