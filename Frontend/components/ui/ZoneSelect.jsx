'use client';

import { useEffect, useState } from 'react';
import Select from '@/components/ui/Select';
import { getZones } from '@/lib/geo-api';

// Zone dropdown backed by /api/zones (with a static fallback).
export default function ZoneSelect({ value, onChange, label = 'Zone' }) {
  const [zones, setZones] = useState([]);
  useEffect(() => { getZones().then(setZones).catch(() => {}); }, []);

  return (
    <Select label={label} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select zone…</option>
      {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
    </Select>
  );
}
