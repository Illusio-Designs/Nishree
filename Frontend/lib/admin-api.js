import api, { getProducts, getCategories } from '@/lib/api';

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
export const adminListOrders = async () => {
  const { data } = await api.get('/api/orders');
  return unwrap(data, ['orders']) || [];
};
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
  // Demo fallback (public categories / mock) so the page is testable offline.
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
export const adminListProducts = async () => {
  // getProducts already falls back to the demo catalogue when the API is empty.
  return getProducts({ limit: 200 });
};
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

/* --------------------------------- Users -------------------------------- */
export const adminListUsers = async () => {
  const { data } = await api.get('/api/users/all');
  return unwrap(data, ['users']) || [];
};

/* ============================ B2B management ============================ */

export const adminListParties = async () => (await api.get('/api/parties')).data || [];
export const adminCreateParty = async (p) => (await api.post('/api/parties', p)).data;
export const adminUpdateParty = async (id, p) => (await api.put(`/api/parties/${id}`, p)).data;
export const adminDeleteParty = async (id) => (await api.delete(`/api/parties/${id}`)).data;

export const adminListDistributors = async () => (await api.get('/api/distributors')).data || [];
export const adminCreateDistributor = async (p) => (await api.post('/api/distributors', p)).data;
export const adminUpdateDistributor = async (id, p) => (await api.put(`/api/distributors/${id}`, p)).data;
export const adminDeleteDistributor = async (id) => (await api.delete(`/api/distributors/${id}`)).data;

export const adminListSalesmen = async () => (await api.get('/api/salesmen')).data || [];
export const adminSetSalesmanStatus = async (id, status) => (await api.patch(`/api/salesmen/${id}/status`, { status })).data;
export const adminDeleteSalesman = async (id) => (await api.delete(`/api/salesmen/${id}`)).data;

export const adminListJourneys = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return (await api.get(`/api/salesman-journeys${qs ? `?${qs}` : ''}`)).data || [];
};

export const adminListZones = async () => (await api.get('/api/zones')).data || [];
export const adminCreateZone = async (p) => (await api.post('/api/zones', p)).data;
export const adminUpdateZone = async (id, p) => (await api.put(`/api/zones/${id}`, p)).data;
export const adminDeleteZone = async (id) => (await api.delete(`/api/zones/${id}`)).data;

export const adminListOffers = async () => (await api.get('/api/offers')).data || [];
export const adminCreateOffer = async (p) => (await api.post('/api/offers', p)).data;
export const adminUpdateOffer = async (id, p) => (await api.put(`/api/offers/${id}`, p)).data;
export const adminDeleteOffer = async (id) => (await api.delete(`/api/offers/${id}`)).data;

export const adminListEvents = async () => (await api.get('/api/events')).data || [];
export const adminCreateEvent = async (p) => (await api.post('/api/events', p)).data;
export const adminUpdateEvent = async (id, p) => (await api.put(`/api/events/${id}`, p)).data;
export const adminDeleteEvent = async (id) => (await api.delete(`/api/events/${id}`)).data;

export const adminListB2BOrders = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return (await api.get(`/api/b2b-orders${qs ? `?${qs}` : ''}`)).data || [];
};

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
