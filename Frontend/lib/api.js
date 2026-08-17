import axios from 'axios';

// Base URL of the Express backend. Public endpoints live under /api/.../public.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.nishree.com';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// A stable per-browser id so guests get their own cart/wishlist (no login).
export const guestId = () => {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem('nishree_guest_id');
  if (!id) {
    id = (window.crypto?.randomUUID?.() || `g-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem('nishree_guest_id', id);
  }
  return id;
};

// Attach the stored JWT + guest id (browser only) to requests.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-guest-id'] = guestId();
  }
  return config;
});

// On 401 (missing/expired/invalid token), drop the stale session so the app
// returns to a signed-out state instead of silently failing every call.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('nishree-auth-change'));
      }
    }
    return Promise.reject(error);
  },
);

// Turn a stored image path into an absolute URL against the backend.
export const mediaUrl = (path) => {
  if (!path) return '';
  // Pass through absolute URLs and inline data URIs.
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

/* ----------------------------- Public catalogue ----------------------------- */

export const getCategories = async () => {
  const { data } = await api.get('/api/categories/public/categories');
  return data?.data || data?.categories || data || [];
};

export const getCategory = async (id) => {
  const { data } = await api.get(`/api/categories/public/categories/${id}`);
  return data?.data || data;
};

export const getSliders = async () => {
  const { data } = await api.get('/api/sliders/public/sliders');
  return data?.data || data?.sliders || data || [];
};

export const getProducts = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const { data } = await api.get(`/api/products/public${qs ? `?${qs}` : ''}`);
  // Public endpoint returns { data: { products: [...] } }; also tolerate flatter shapes.
  const d = data?.data ?? data;
  return d?.products || (Array.isArray(d) ? d : []);
};

export const getProduct = async (id) => {
  const { data } = await api.get(`/api/products/public/${id}`);
  return data?.data || data?.product || data || null;
};

export const getCoupons = async () => {
  const { data } = await api.get('/api/coupons/public');
  return data?.data || data?.coupons || data || [];
};

export const getReviews = async (productId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const { data } = await api.get(
    `/api/reviews/public/${productId}${qs ? `?${qs}` : ''}`,
  );
  return data?.data || data;
};

// All approved reviews across products, for the homepage reviews section.
export const getAllPublicReviews = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const { data } = await api.get(`/api/reviews/public${qs ? `?${qs}` : ''}`);
  return data?.reviews || [];
};

// Submit a public product review (name/email/rating/comment + optional images).
// Reviews start as 'pending' and appear once an admin approves them.
export const createReview = async ({ productId, rating, comment, name, email, files = [] }) => {
  const fd = new FormData();
  fd.append('productId', productId);
  fd.append('rating', rating);
  fd.append('comment', comment);
  fd.append('name', name);
  fd.append('email', email);
  (files || []).forEach((f) => fd.append('files', f));
  const { data } = await api.post('/api/reviews/public', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getPolicies = async () => {
  const { data } = await api.get('/api/policies');
  return data?.data || data?.policies || data || [];
};

// Validate a coupon against the current order amount. Returns
// { coupon, discountAmount, finalAmount }. userId is optional (guests allowed).
export const validateCoupon = async ({ code, orderAmount, userId }) => {
  const { data } = await api.post('/api/coupons/validate', { code, orderAmount, userId });
  return data;
};

// Active coupons available to show at checkout.
export const getPublicCoupons = async () => {
  const { data } = await api.get('/api/coupons/public');
  return data?.coupons || data?.data || [];
};

/* ------------------------- Recipes / Blog + Wholesale ------------------------- */

export const getBlogs = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const { data } = await api.get(`/api/blogs/public${qs ? `?${qs}` : ''}`);
  return data?.data || data?.blogs || data || [];
};

export const getBlog = async (slug) => {
  const { data } = await api.get(`/api/blogs/public/${slug}`);
  return data?.data || data?.blog || data || null;
};

export const submitWholesaleEnquiry = async (payload) => {
  const { data } = await api.post('/api/wholesale-enquiries/public', payload);
  return data;
};

// Public "Contact us" form submission.
export const createContactMessage = async (payload) => {
  const { data } = await api.post('/api/contact', payload);
  return data;
};

/* -------------------------------- Auth -------------------------------- */

export const login = async (credentials) => {
  const { data } = await api.post('/api/users/login', credentials);
  return data;
};

export const register = async (payload) => {
  const { data } = await api.post('/api/users/register', payload);
  return data;
};

/* ------------------------------- Checkout ------------------------------- */

// Create a shipping address for the logged-in user; returns the created record.
export const createShippingAddress = async (payload) => {
  const { data } = await api.post('/api/shipping/addresses', payload);
  return data?.shippingAddress || data?.data || data?.address || data;
};

// Place an order. `items` = [{ product_id, variation_id, quantity }].
export const createOrder = async (payload) => {
  const { data } = await api.post('/api/orders', payload);
  return data?.order || data?.data || data;
};

// Place an order without an account (guest checkout). `payload` carries the
// guest_name/email/phone, an inline shipping_address, items and payment_type.
export const createGuestOrder = async (payload) => {
  const { data } = await api.post('/api/guest/checkout', payload);
  return data?.order || data?.data || data;
};

// The logged-in user's own orders.
export const getMyOrders = async () => {
  const { data } = await api.get('/api/orders/my-orders');
  return data?.data || data?.orders || data || [];
};

// The logged-in user's saved shipping addresses.
export const getMyAddresses = async () => {
  const { data } = await api.get('/api/shipping/addresses');
  return data?.shippingAddresses || data?.data || data || [];
};

export const updateShippingAddress = async (id, payload) => {
  const { data } = await api.put(`/api/shipping/addresses/${id}`, payload);
  return data?.shippingAddress || data?.data || data;
};

export const deleteShippingAddress = async (id) => (await api.delete(`/api/shipping/addresses/${id}`)).data;

export const setDefaultShippingAddress = async (id) =>
  (await api.put(`/api/shipping/addresses/${id}/default`)).data;

export default api;
