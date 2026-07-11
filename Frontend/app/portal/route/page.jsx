'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Add01Icon, Location01Icon, CheckmarkCircle02Icon, Cancel01Icon, MapsLocation01Icon } from 'hugeicons-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import StatusPill from '@/components/admin/StatusPill';
import JourneyMap from '@/components/admin/JourneyMap';
import AddPartyModal from '@/components/portal/AddPartyModal';
import { getMyRoute, setStopStatus, createCheckin } from '@/lib/portal-api';

export default function RoutePage() {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const load = () => {
    setLoading(true);
    getMyRoute().then((r) => setRoute(r)).catch(() => setRoute(null)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  // Optimistically update a stop locally, then persist best-effort (keeps the
  // demo interactive even without a backend).
  const updateStop = (stop, status, extra = {}) => {
    setRoute((r) => ({
      ...r,
      stops: r.stops.map((s) => (s.id === stop.id ? { ...s, status, ...extra } : s)),
      summary: recomputeSummary(r.stops.map((s) => (s.id === stop.id ? { ...s, status } : s))),
    }));
    setStopStatus(stop.id, status, extra.skip_reason).catch(() => {});
  };

  const recomputeSummary = (stops) => ({
    total: stops.length,
    visited: stops.filter((s) => s.status === 'visited').length,
    skipped: stops.filter((s) => s.status === 'skipped').length,
    pending: stops.filter((s) => s.status === 'pending').length,
  });

  const checkIn = (stop) => {
    const done = (coords) => {
      createCheckin({ party_id: stop.Party?.id, latitude: coords?.latitude, longitude: coords?.longitude, reason: 'Route visit' }).catch(() => {});
      updateStop(stop, 'visited', { visited_at: new Date().toISOString() });
      toast.success(`Checked in at ${stop.Party?.shop_name}`);
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => done(pos.coords), () => done(null), { timeout: 6000 });
    } else done(null);
  };

  const skip = (stop) => {
    const reason = window.prompt('Reason for skipping this stop?') || 'Skipped';
    updateStop(stop, 'skipped', { skip_reason: reason });
    toast.info('Stop skipped');
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>;

  const stops = route?.stops || [];
  const s = route?.summary || {};
  const markers = stops
    .filter((st) => st.Party?.latitude && st.Party?.longitude)
    .map((st) => ({ latitude: st.Party.latitude, longitude: st.Party.longitude, type: st.status === 'visited' ? 'order' : 'checkin', label: st.Party.shop_name }));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Today&apos;s Route</h1>
          <p className="text-body">Your zone beat plan for {route?.date ? new Date(route.date).toLocaleDateString() : 'today'}.</p>
        </div>
        <Button icon={Add01Icon} onClick={() => setAddOpen(true)}>Add party</Button>
      </div>

      {/* summary */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total stops', value: s.total ?? stops.length },
          { label: 'Visited', value: s.visited ?? 0 },
          { label: 'Skipped', value: s.skipped ?? 0 },
          { label: 'Pending', value: s.pending ?? 0 },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <p className="text-xs text-muted">{k.label}</p>
            <p className="mt-0.5 text-2xl font-bold text-ink">{k.value}</p>
          </Card>
        ))}
      </div>

      {markers.length > 0 && <div className="mb-5"><JourneyMap points={[]} markers={markers} height={260} /></div>}

      {/* stops */}
      <div className="space-y-3">
        {stops.map((stop) => (
          <Card key={stop.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">{stop.sequence}</span>
              <div>
                <p className="font-semibold text-ink">
                  {stop.Party?.shop_name}
                  {stop.ad_hoc && <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700 align-middle">New</span>}
                </p>
                <p className="text-sm text-muted">{[stop.Party?.address, stop.Party?.city].filter(Boolean).join(', ') || '—'}</p>
                <div className="mt-1"><StatusPill status={stop.status} />{stop.skip_reason && <span className="ml-2 text-xs text-muted">· {stop.skip_reason}</span>}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {stop.Party?.latitude && (
                <a href={`https://www.google.com/maps?q=${stop.Party.latitude},${stop.Party.longitude}`} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="ghost" icon={MapsLocation01Icon}>Map</Button>
                </a>
              )}
              {stop.status !== 'visited' && <Button size="sm" variant="soft" icon={CheckmarkCircle02Icon} onClick={() => checkIn(stop)}>Check-in</Button>}
              {stop.status === 'pending' && <Button size="sm" variant="secondary" icon={Cancel01Icon} onClick={() => skip(stop)}>Skip</Button>}
            </div>
          </Card>
        ))}
      </div>

      <AddPartyModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={load} />
    </div>
  );
}
