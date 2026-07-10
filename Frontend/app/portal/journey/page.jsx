'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { PlayIcon, StopIcon, Route02Icon } from 'hugeicons-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import JourneyMap from '@/components/admin/JourneyMap';
import { getActiveJourney, startJourney, endJourney } from '@/lib/portal-api';

export default function PortalJourney() {
  const [journey, setJourney] = useState(null);
  const [points, setPoints] = useState([]);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getActiveJourney().then((d) => { setActive(!!d?.active); setJourney(d?.journey || null); setPoints(d?.points || []); })
      .catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const gps = () => new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition((p) => resolve(p.coords), () => resolve(null), { timeout: 6000 });
  });

  const start = async () => {
    const c = await gps();
    startJourney({ latitude: c?.latitude, longitude: c?.longitude }).catch(() => {});
    setActive(true);
    toast.success('Journey started — your route is now being tracked');
  };
  const end = async () => {
    const c = await gps();
    endJourney({ latitude: c?.latitude, longitude: c?.longitude }).catch(() => {});
    setActive(false);
    toast.success('Journey ended');
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>;

  const km = Math.round(((Number(journey?.total_distance_m) || 0) / 1000) * 100) / 100;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Journey</h1>
          <p className="text-body">Live GPS tracking of your day&apos;s route.</p>
        </div>
        {active
          ? <Button variant="danger" icon={StopIcon} onClick={end}>End journey</Button>
          : <Button icon={PlayIcon} onClick={start}>Start journey</Button>}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="p-4"><p className="text-xs text-muted">Status</p><p className="mt-0.5 text-lg font-bold text-ink">{active ? 'Active' : 'Not started'}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-xs text-muted"><Route02Icon size={13} strokeWidth={2} /> Distance</div><p className="mt-0.5 text-lg font-bold text-ink">{km} km</p></Card>
        <Card className="p-4"><p className="text-xs text-muted">GPS points</p><p className="mt-0.5 text-lg font-bold text-ink">{points.length}</p></Card>
      </div>

      <JourneyMap points={points} markers={[]} height={340} />
      <p className="mt-3 text-sm text-muted">Distance is measured from real GPS pings (Haversine) as you move through the day.</p>
    </div>
  );
}
