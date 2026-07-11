'use client';

import { useEffect, useState } from 'react';
import Select from '@/components/ui/Select';
import { getCountries, getStates, getCities } from '@/lib/geo-api';

// Cascading Country → State → City dropdowns backed by the /api/geo endpoints
// (with a static fallback). `value` = { country, state, city }; onChange gets the
// merged object. Layout is a responsive 3-up row.
export default function LocationSelect({ value = {}, onChange, required }) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    getCountries().then(setCountries).catch(() => {});
    getStates().then(setStates).catch(() => {});
  }, []);

  useEffect(() => {
    if (value.state) getCities(value.state).then(setCities).catch(() => setCities([]));
    else setCities([]);
  }, [value.state]);

  const set = (patch) => onChange({ ...value, ...patch });

  // Keep an existing value visible even if it isn't in the fetched list.
  const withCurrent = (opts, current) => {
    if (current && !opts.some((o) => o.name === current)) return [{ id: `cur-${current}`, name: current }, ...opts];
    return opts;
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Select label="Country" value={value.country || 'India'} onChange={(e) => set({ country: e.target.value })}>
        <option value="">Select…</option>
        {withCurrent(countries, value.country).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
      </Select>
      <Select label="State" value={value.state || ''} onChange={(e) => set({ state: e.target.value, city: '' })} required={required}>
        <option value="">Select state…</option>
        {withCurrent(states, value.state).map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
      </Select>
      <Select label="City" value={value.city || ''} onChange={(e) => set({ city: e.target.value })} required={required}>
        <option value="">{value.state ? 'Select city…' : 'Pick a state first'}</option>
        {withCurrent(cities, value.city).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
      </Select>
    </div>
  );
}
