import api from '@/lib/api';
import { adminListZones } from '@/lib/admin-api';

const list = async (fn) => {
  try {
    const data = await fn();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const getCountries = () => list(async () => (await api.get('/api/geo/countries')).data);
export const getStates = () => list(async () => (await api.get('/api/geo/states')).data);
export const getCities = (stateName) =>
  list(async () => (await api.get(`/api/geo/cities?state=${encodeURIComponent(stateName || '')}`)).data);

// Zones come from the backend zones endpoint.
export const getZones = () => list(() => adminListZones());
