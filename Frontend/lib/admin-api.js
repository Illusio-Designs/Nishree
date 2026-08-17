import api, { getProducts, getCategories } from '@/lib/api';

// Run an API list call and always return an array (empty on error).
const listApi = async (fn) => {
  const data = await fn();
  return Array.isArray(data) ? data : [];
};

// Thin admin API layer. Each resource exposes list/create/update/remove where the
// backend supports it. Multipart resources (products, categories) send FormData.

const unwrap = (data, keys = []) => {
  for (const k of keys) if (data?.[k] != null) return data[k];
  return data?.data ?? data;
};

/* ------------------------------- Dashboard ------------------------------- */
export const getAdvancedAnalytics = async () => {
  const { data } = await api.get('/api/dashboard/advanced-analytics');
  return unwrap(data, ['analytics']);
};
export const getOrderStats = async () => {
  const { data } = await api.get('/api/orders/stats/overview');
  return unwrap(data, ['stats']);
};

/* -------------------------------- Orders -------------------------------- */
export const adminListOrders = async () =>
  listApi(async () => { const { data } = await api.get('/api/orders'); return unwrap(data, ['orders']); });
export const adminUpdateOrderStatus = async (id, status) => {
  const { data } = await api.put(`/api/orders/${id}/status`, { status });
  return data;
};

/* ------------------------------ Categories ------------------------------ */
export const adminListCategories = async () => {
  try {
    const { data } = await api.get('/api/categories/admin/all');
    const list = unwrap(data, ['categories']);
    if (Array.isArray(list) && list.length) return list;
  } catch { /* fall through */ }
  // Fall back to the public categories endpoint if the admin list is empty.
  return getCategories();
};
export const adminCreateCategory = async (payload) => {
  const { data } = await api.post('/api/categories/admin', toFormData(payload), formHeaders);
  return data;
};
export const adminUpdateCategory = async (id, payload) => {
  const { data } = await api.put(`/api/categories/admin/${id}`, toFormData(payload), formHeaders);
  return data;
};
export const adminDeleteCategory = async (id) => (await api.delete(`/api/categories/admin/${id}`)).data;

/* ------------------------------- Products ------------------------------- */
// Admin sees the full catalogue (all statuses) via /api/products; falls back to
// the public (active-only) list if the admin route is unavailable.
export const adminListProducts = async () =>
  listApi(async () => {
    try {
      const { data } = await api.get('/api/products?limit=200');
      const list = data?.products || data?.data?.products || (Array.isArray(data) ? data : []);
      return list;
    } catch {
      return getProducts({ limit: 200 });
    }
  });
export const adminCreateProduct = async (payload) => {
  const { data } = await api.post('/api/products', toFormData(payload), formHeaders);
  return data;
};
export const adminUpdateProduct = async (id, payload) => {
  const { data } = await api.put(`/api/products/${id}`, toFormData(payload), formHeaders);
  return data;
};
export const adminDeleteProduct = async (id) => (await api.delete(`/api/products/${id}`)).data;

/* -------------------------------- Coupons ------------------------------- */
export const adminListCoupons = async () => {
  const { data } = await api.get('/api/coupons');
  return unwrap(data, ['coupons']) || [];
};
export const adminCreateCoupon = async (payload) => (await api.post('/api/coupons', payload)).data;
export const adminUpdateCoupon = async (id, payload) => (await api.put(`/api/coupons/${id}`, payload)).data;
export const adminDeleteCoupon = async (id) => (await api.delete(`/api/coupons/${id}`)).data;

/* -------------------------------- Sliders ------------------------------- */
export const adminListSliders = async () =>
  listApi(async () => { const { data } = await api.get('/api/sliders/admin/all'); return unwrap(data, ['sliders']); });
export const adminCreateSlider = async (payload) => (await api.post('/api/sliders', toFormData(payload), formHeaders)).data;
export const adminUpdateSlider = async (id, payload) => (await api.put(`/api/sliders/${id}`, toFormData(payload), formHeaders)).data;
export const adminDeleteSlider = async (id) => (await api.delete(`/api/sliders/${id}`)).data;

/* -------------------------------- Reviews ------------------------------- */
export const adminListReviews = async () =>
  listApi(async () => { const { data } = await api.get('/api/reviews/admin/all?limit=200'); return unwrap(data, ['reviews']); });
export const adminModerateReview = async (id, status) =>
  (await api.put(`/api/reviews/admin/${id}/moderate`, { status })).data;
export const adminDeleteReview = async (id) => (await api.delete(`/api/reviews/admin/${id}`)).data;

/* -------------------------------- Policies ------------------------------ */
export const adminListPolicies = async () =>
  listApi(async () => { const { data } = await api.get('/api/policies'); return unwrap(data, ['policies']); });
export const adminCreatePolicy = async (payload) => (await api.post('/api/policies', payload)).data;
export const adminUpdatePolicy = async (id, payload) => (await api.put(`/api/policies/${id}`, payload)).data;
export const adminDeletePolicy = async (id) => (await api.delete(`/api/policies/${id}`)).data;

/* --------------------------------- Users -------------------------------- */
export const adminListUsers = async () =>
  listApi(async () => { const { data } = await api.get('/api/users/all'); return unwrap(data, ['users']); });

/* ============================ B2B management ============================ */

export const adminListParties = async () =>
  listApi(async () => (await api.get('/api/parties')).data);
export const adminCreateParty = async (p) => (await api.post('/api/parties', p)).data;
export const adminUpdateParty = async (id, p) => (await api.put(`/api/parties/${id}`, p)).data;
export const adminDeleteParty = async (id) => (await api.delete(`/api/parties/${id}`)).data;

export const adminListDistributors = async () =>
  listApi(async () => (await api.get('/api/distributors')).data);
export const adminCreateDistributor = async (p) => (await api.post('/api/distributors', p)).data;
export const adminUpdateDistributor = async (id, p) => (await api.put(`/api/distributors/${id}`, p)).data;
export const adminDeleteDistributor = async (id) => (await api.delete(`/api/distributors/${id}`)).data;

export const adminListSalesmen = async () =>
  listApi(async () => (await api.get('/api/salesmen')).data);
export const adminCreateSalesman = async (p) => (await api.post('/api/salesmen', p)).data;
export const adminUpdateSalesman = async (id, p) => (await api.put(`/api/salesmen/${id}`, p)).data;
export const adminSetSalesmanStatus = async (id, status) => (await api.patch(`/api/salesmen/${id}/status`, { status })).data;
export const adminDeleteSalesman = async (id) => (await api.delete(`/api/salesmen/${id}`)).data;

// Build (or fetch) a salesman's zone-based daily route. Managers pass salesman_id.
export const adminGetSalesmanRoute = async (id, date) => {
  const qs = new URLSearchParams({ salesman_id: id, ...(date ? { date } : {}) }).toString();
  try {
    const { data } = await api.get(`/api/salesman-routes/my?${qs}`);
    if (data && Array.isArray(data.stops)) return data;
  } catch { /* fall through */ }
  return { stops: [], summary: {} };
};

export const adminListJourneys = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return listApi(async () => (await api.get(`/api/salesman-journeys${qs ? `?${qs}` : ''}`)).data);
};
export const adminGetJourney = async (id) => {
  try {
    const { data } = await api.get(`/api/salesman-journeys/${id}`);
    if (data && (data.journey || data.points)) return data;
  } catch { /* fall through */ }
  return null;
};

export const adminListZones = async () => (await api.get('/api/zones')).data || [];
export const adminCreateZone = async (p) => (await api.post('/api/zones', p)).data;
export const adminUpdateZone = async (id, p) => (await api.put(`/api/zones/${id}`, p)).data;
export const adminDeleteZone = async (id) => (await api.delete(`/api/zones/${id}`)).data;

export const adminListOffers = async () =>
  listApi(async () => (await api.get('/api/offers')).data);
export const adminCreateOffer = async (p) => (await api.post('/api/offers', p)).data;
export const adminUpdateOffer = async (id, p) => (await api.put(`/api/offers/${id}`, p)).data;
export const adminDeleteOffer = async (id) => (await api.delete(`/api/offers/${id}`)).data;

export const adminListEvents = async () =>
  listApi(async () => (await api.get('/api/events')).data);
export const adminCreateEvent = async (p) => (await api.post('/api/events', p)).data;
export const adminUpdateEvent = async (id, p) => (await api.put(`/api/events/${id}`, p)).data;
export const adminDeleteEvent = async (id) => (await api.delete(`/api/events/${id}`)).data;

export const adminListB2BOrders = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return listApi(async () => (await api.get(`/api/b2b-orders${qs ? `?${qs}` : ''}`)).data);
};

/* -------------------------- Salesman targets ------------------------ */
export const adminListTargets = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return listApi(async () => (await api.get(`/api/salesman-targets${qs ? `?${qs}` : ''}`)).data);
};
export const adminCreateTarget = async (p) => (await api.post('/api/salesman-targets', p)).data;
export const adminUpdateTarget = async (id, p) => (await api.put(`/api/salesman-targets/${id}`, p)).data;
export const adminDeleteTarget = async (id) => (await api.delete(`/api/salesman-targets/${id}`)).data;

/* -------------------------- Salesman expenses ----------------------- */
export const adminListExpenses = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return listApi(async () => (await api.get(`/api/salesman-expenses${qs ? `?${qs}` : ''}`)).data);
};
export const adminSetExpenseStatus = async (id, status) => (await api.patch(`/api/salesman-expenses/${id}/status`, { status })).data;
export const adminDeleteExpense = async (id) => (await api.delete(`/api/salesman-expenses/${id}`)).data;

/* -------------------------- Blog / Recipes -------------------------- */
export const adminListBlogs = async () =>
  listApi(async () => (await api.get('/api/blogs')).data);
export const adminCreateBlog = async (p) => (await api.post('/api/blogs', toFormData(p), formHeaders)).data;
export const adminUpdateBlog = async (id, p) => (await api.put(`/api/blogs/${id}`, toFormData(p), formHeaders)).data;
export const adminDeleteBlog = async (id) => (await api.delete(`/api/blogs/${id}`)).data;

/* ------------------------ Wholesale enquiries ----------------------- */
export const adminListEnquiries = async () =>
  listApi(async () => (await api.get('/api/wholesale-enquiries')).data);
export const adminSetEnquiryStatus = async (id, status) => (await api.patch(`/api/wholesale-enquiries/${id}/status`, { status })).data;
export const adminDeleteEnquiry = async (id) => (await api.delete(`/api/wholesale-enquiries/${id}`)).data;

/* -------------------------- Contact messages ------------------------ */
export const adminListMessages = async () =>
  listApi(async () => (await api.get('/api/contact')).data);
export const adminSetMessageStatus = async (id, status) => (await api.patch(`/api/contact/${id}/status`, { status })).data;
export const adminDeleteMessage = async (id) => (await api.delete(`/api/contact/${id}`)).data;

/* -------------------------------- helpers ------------------------------- */
const formHeaders = { headers: { 'Content-Type': 'multipart/form-data' } };

// Convert a plain object (possibly with File values) into FormData.
function toFormData(payload) {
  if (payload instanceof FormData) return payload;
  const fd = new FormData();
  Object.entries(payload || {}).forEach(([k, v]) => {
    if (v == null) return;
    if (v instanceof File) fd.append(k, v);
    else if (Array.isArray(v) || typeof v === 'object') fd.append(k, JSON.stringify(v));
    else fd.append(k, v);
  });
  return fd;
}
