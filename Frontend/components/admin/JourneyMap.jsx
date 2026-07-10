'use client';

// Self-contained SVG route map (no external tiles): plots the day's GPS
// breadcrumbs as a path, with start/end markers and check-in / order pins.
// Works offline; a "Open in Google Maps" link gives the real interactive map.
export default function JourneyMap({ points = [], markers = [], height = 340 }) {
  const W = 640;
  const H = height;
  const pad = 28;

  const coords = [
    ...points.map((p) => ({ lat: +p.latitude, lng: +p.longitude })),
    ...markers.map((m) => ({ lat: +m.latitude, lng: +m.longitude })),
  ].filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng));

  if (coords.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-line bg-surface-soft text-sm text-muted" style={{ height }}>
        No GPS data recorded for this journey.
      </div>
    );
  }

  const lats = coords.map((c) => c.lat);
  const lngs = coords.map((c) => c.lng);
  let minLat = Math.min(...lats), maxLat = Math.max(...lats);
  let minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  // Avoid zero-range (single point / straight line).
  if (maxLat - minLat < 1e-4) { minLat -= 0.002; maxLat += 0.002; }
  if (maxLng - minLng < 1e-4) { minLng -= 0.002; maxLng += 0.002; }

  const px = (lng) => pad + ((lng - minLng) / (maxLng - minLng)) * (W - 2 * pad);
  const py = (lat) => pad + (1 - (lat - minLat) / (maxLat - minLat)) * (H - 2 * pad);

  const routePts = points.filter((p) => Number.isFinite(+p.latitude));
  const path = routePts.map((p) => `${px(+p.longitude)},${py(+p.latitude)}`).join(' ');
  const start = routePts[0];
  const end = routePts[routePts.length - 1];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface-soft">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Journey route map">
        {/* subtle grid */}
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="var(--color-line)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />

        {/* route */}
        {path && <polyline points={path} fill="none" stroke="var(--color-brand-600)" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />}

        {/* track dots */}
        {routePts.map((p, i) => (
          <circle key={`t${i}`} cx={px(+p.longitude)} cy={py(+p.latitude)} r="2.5" fill="var(--color-brand-400)" />
        ))}

        {/* check-in / order pins */}
        {markers.map((m, i) => {
          const isOrder = m.type === 'order';
          return (
            <g key={`m${i}`}>
              <circle cx={px(+m.longitude)} cy={py(+m.latitude)} r="8" fill={isOrder ? 'var(--color-brand-700)' : 'var(--color-warning)'} stroke="#fff" strokeWidth="2" />
              <title>{m.label}</title>
            </g>
          );
        })}

        {/* start / end */}
        {start && <circle cx={px(+start.longitude)} cy={py(+start.latitude)} r="7" fill="var(--color-success)" stroke="#fff" strokeWidth="2" />}
        {end && <circle cx={px(+end.longitude)} cy={py(+end.latitude)} r="7" fill="var(--color-danger)" stroke="#fff" strokeWidth="2" />}
      </svg>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-line px-4 py-2 text-xs text-body">
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-success)' }} /> Start</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-danger)' }} /> End</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-warning)' }} /> Check-in</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-brand-700)' }} /> Order</span>
      </div>
    </div>
  );
}
