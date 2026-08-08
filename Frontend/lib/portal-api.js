import api from '@/lib/api';

// Run a portal API call and return its data, or a safe empty value on failure.
const call = async (fn, empty = null) => {
  try {
    const data = await fn();
    return data ?? empty;
  } catch {
    return empty;
  }
};

/* -------------------------------- Profiles -------------------------------- */
export const getMyParty = () => call(async () => (await api.get('/api/parties/my')).data);
export const getMyDistributor = () => call(async () => (await api.get('/api/distributors/my')).data);
export const getMySalesman = () => call(async () => (await api.get('/api/salesmen/my')).data);

/* ------------------------------- Orders ------------------------------- */
export const getMyB2BOrders = () => call(async () => (await api.get('/api/b2b-orders/my')).data, []);
export const placeB2BOrder = async (payload) => (await api.post('/api/b2b-orders', payload)).data;

/* -------------------------- Salesman route (beat) -------------------------- */
export const getMyRoute = (date) =>
  call(async () => (await api.get(`/api/salesman-routes/my${date ? `?date=${date}` : ''}`)).data, { stops: [], summary: {} });
export const setStopStatus = async (id, status, skip_reason) =>
  (await api.patch(`/api/salesman-routes/stops/${id}`, { status, skip_reason })).data;

/* --------------------------- Field actions --------------------------- */
export const createParty = async (payload) => (await api.post('/api/parties', payload)).data;
export const createCheckin = async (payload) => (await api.post('/api/salesman-checkins', payload)).data;

/* -------------------------- Targets & reports -------------------------- */
export const getMyTargets = () => call(async () => (await api.get('/api/salesman-targets')).data, []);
export const getTargetAchievement = () =>
  call(async () => (await api.get('/api/b2b-analytics/target-achievement')).data);
export const getVisitReport = () =>
  call(async () => (await api.get('/api/b2b-analytics/visit-report')).data);

/* -------------------------------- Journey -------------------------------- */
export const getActiveJourney = () =>
  call(async () => (await api.get('/api/salesman-journeys/active')).data, { active: false });
export const startJourney = async (payload) => (await api.post('/api/salesman-journeys/start', payload)).data;
export const trackJourney = async (payload) => (await api.post('/api/salesman-journeys/track', payload)).data;
export const endJourney = async (payload) => (await api.post('/api/salesman-journeys/end', payload)).data;

/* -------------------------------- Distributor -------------------------------- */
export const getDistributorParties = (id) =>
  call(async () => (await api.get(`/api/distributors/${id}/parties`)).data, []);

/* ---------------------------------- OTP ---------------------------------- */
// Verify an MSG91 access-token (from the widget) and get a JWT.
export const otpLogin = async (payload) => {
  const { data } = await api.post('/api/users/otp-login', payload);
  return data;
};
