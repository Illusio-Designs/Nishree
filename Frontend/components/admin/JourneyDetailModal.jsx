'use client';

import { useEffect, useState } from 'react';
import { Location01Icon, Route02Icon, ShoppingBag02Icon, MapsLocation01Icon } from 'hugeicons-react';
import Modal from '@/components/admin/Modal';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import JourneyMap from '@/components/admin/JourneyMap';
import { formatPrice } from '@/lib/format';
import { adminGetJourney } from '@/lib/admin-api';

const time = (t) => (t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—');

export default function JourneyDetailModal({ id, open, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || id == null) return;
    setLoading(true);
    setData(null);
    adminGetJourney(id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id, open]);

  const journey = data?.journey || {};
  const points = data?.points || [];
  const checkins = data?.timeline?.checkins || [];
  const orders = data?.timeline?.orders || [];
  const summary = data?.summary || {};

  const markers = [
    ...checkins.map((c) => ({ latitude: c.Party?.latitude, longitude: c.Party?.longitude, type: 'checkin', label: c.Party?.shop_name })),
    ...orders.map((o) => ({ latitude: o.latitude, longitude: o.longitude, type: 'order', label: o.party })),
  ].filter((m) => Number.isFinite(+m.latitude) && Number.isFinite(+m.longitude));

  const rows = [
    { type: 'Start', time: journey.start_time, title: 'Day started' },
    ...checkins.map((c) => ({ type: 'Check-in', time: c.created_at, title: c.Party?.shop_name || 'Visit', note: c.reason })),
    ...orders.map((o) => ({ type: 'Order', time: o.created_at, title: o.party || o.order_number, note: `${o.qty || 0} qty · ${formatPrice(o.amount)}` })),
    journey.end_time ? { type: 'End', time: journey.end_time, title: 'Day ended' } : null,
  ].filter(Boolean).sort((a, b) => new Date(a.time || 0) - new Date(b.time || 0));

  const mapsUrl = () => {
    const pts = points.filter((p) => Number.isFinite(+p.latitude));
    if (!pts.length) return null;
    const sample = pts.length <= 8 ? pts : pts.filter((_, i) => i % Math.ceil(pts.length / 8) === 0);
    return `https://www.google.com/maps/dir/${sample.map((p) => `${p.latitude},${p.longitude}`).join('/')}`;
  };
  const url = mapsUrl();

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Journey — ${journey.Salesman?.name || 'Salesman'}${journey.journey_date ? ` · ${new Date(journey.journey_date).toLocaleDateString()}` : ''}`}
    >
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={30} /></div>
      ) : (
        <div className="space-y-5">
          {/* summary chips */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Route02Icon, label: 'Distance', value: `${summary.total_distance_km ?? 0} km` },
              { icon: Location01Icon, label: 'Check-ins', value: summary.checkins ?? checkins.length },
              { icon: ShoppingBag02Icon, label: 'Orders', value: summary.orders ?? orders.length },
              { icon: Route02Icon, label: 'GPS points', value: summary.points ?? points.length },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-surface-soft p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted"><s.icon size={14} strokeWidth={2} /> {s.label}</div>
                <p className="mt-0.5 text-lg font-bold text-ink">{s.value}</p>
              </div>
            ))}
          </div>

          {/* map */}
          <JourneyMap points={points} markers={markers} />

          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex">
              <Button variant="secondary" icon={MapsLocation01Icon}>Open in Google Maps</Button>
            </a>
          )}

          {/* timeline */}
          <div>
            <h3 className="mb-2 text-sm font-bold text-ink">Day timeline</h3>
            <ol className="relative space-y-3 border-l border-line pl-5">
              {rows.map((r, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-600" />
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        <span className="mr-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">{r.type}</span>
                        {r.title}
                      </p>
                      {r.note && <p className="text-xs text-muted">{r.note}</p>}
                    </div>
                    <span className="shrink-0 text-xs text-muted">{time(r.time)}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </Modal>
  );
}
