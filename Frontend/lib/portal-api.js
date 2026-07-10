import api, { DEMO_FALLBACK } from '@/lib/api';
import * as pm from '@/lib/portal-mock';

const getOrDemo = async (fn, mock) => {
  try {
    const data = await fn();
    if (data && (Array.isArray(data) ? data.length : (data.id || data.stops || data.rows || data.summary))) return data;
  } catch { /* fall through */ }
  return DEMO_FALLBACK ? mock : (Array.isArray(mock) ? [] : null);
};

/* -------------------------------- Profiles -------------------------------- */
export const getMyParty = () => getOrDemo(async () => (await api.get('/api/parties/my')).data, pm.MY_PARTY);
export const getMyDistributor = () => getOrDemo(async () => (await api.get('/api/distributors/my')).data, pm.MY_DISTRIBUTOR);
export const getMySalesman = () => getOrDemo(async () => (await api.get('/api/salesmen/my')).data, pm.MY_SALESMAN);

/* ------------------------------- Orders ------------------------------- */
export const getMyB2BOrders = () => getOrDemo(async () => (await api.get('/api/b2b-orders/my')).data, pm.MY_ORDERS);
export const placeB2BOrder = async (payload) => (await api.post('/api/b2b-orders', payload)).data;

/* -------------------------- Salesman route (beat) -------------------------- */
export const getMyRoute = (date) =>
  getOrDemo(async () => (await api.get(`/api/salesman-routes/my${date ? `?date=${date}` : ''}`)).data, pm.ROUTE);
export const setStopStatus = async (id, status, skip_reason) =>
  (await api.patch(`/api/salesman-routes/stops/${id}`, { status, skip_reason })).data;

/* --------------------------- Field actions --------------------------- */
export const createParty = async (payload) => (await api.post('/api/parties', payload)).data;
export const createCheckin = async (payload) => (await api.post('/api/salesman-checkins', payload)).data;

/* -------------------------- Targets & reports -------------------------- */
export const getMyTargets = () => getOrDemo(async () => (await api.get('/api/salesman-targets')).data, pm.MY_TARGETS);
export const getTargetAchievement = () =>
  getOrDemo(async () => (await api.get('/api/b2b-analytics/target-achievement')).data, pm.ACHIEVEMENT);
export const getVisitReport = () =>
  getOrDemo(async () => (await api.get('/api/b2b-analytics/visit-report')).data, pm.VISIT_REPORT);

/* -------------------------------- Journey -------------------------------- */
export const getActiveJourney = () =>
  getOrDemo(async () => (await api.get('/api/salesman-journeys/active')).data, { active: true, journey: pm.ACTIVE_JOURNEY.journey, points: pm.ACTIVE_JOURNEY.points });
export const startJourney = async (payload) => (await api.post('/api/salesman-journeys/start', payload)).data;
export const trackJourney = async (payload) => (await api.post('/api/salesman-journeys/track', payload)).data;
export const endJourney = async (payload) => (await api.post('/api/salesman-journeys/end', payload)).data;

/* -------------------------------- Distributor -------------------------------- */
export const getDistributorParties = (id) =>
  getOrDemo(async () => (await api.get(`/api/distributors/${id}/parties`)).data, pm.ROUTE.stops.map((s) => s.Party));

/* ---------------------------------- OTP ---------------------------------- */
// Verify an MSG91 access-token (from the widget) and get a JWT. In demo mode,
// pass { phone } to sign in as a demo B2B user without a live MSG91 account.
export const otpLogin = async (payload) => {
  const { data } = await api.post('/api/users/otp-login', payload);
  return data;
};
