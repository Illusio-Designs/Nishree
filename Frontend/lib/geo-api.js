import api, { DEMO_FALLBACK } from '@/lib/api';
import * as gm from '@/lib/geo-mock';
import { adminListZones } from '@/lib/admin-api';

const list = async (fn, fallback) => {
  try {
    const data = await fn();
    if (Array.isArray(data) && data.length) return data;
  } catch { /* fall through */ }
  return DEMO_FALLBACK ? fallback : [];
};

export const getCountries = () => list(async () => (await api.get('/api/geo/countries')).data, gm.COUNTRIES);
export const getStates = () => list(async () => (await api.get('/api/geo/states')).data, gm.STATES);
export const getCities = (stateName) =>
  list(async () => (await api.get(`/api/geo/cities?state=${encodeURIComponent(stateName || '')}`)).data, gm.citiesForState(stateName));

// Zones reuse the admin list (already has a demo fallback of its own; add one here too).
export const getZones = async () => {
  try {
    const z = await adminListZones();
    if (Array.isArray(z) && z.length) return z;
  } catch { /* fall through */ }
  return DEMO_FALLBACK ? [{ id: 1, name: 'West Zone' }, { id: 2, name: 'North Zone' }, { id: 3, name: 'South Zone' }] : [];
};
