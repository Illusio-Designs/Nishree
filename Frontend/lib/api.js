import axios from 'axios';

// Base URL of the Express backend. Public endpoints live under /api/.../public.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the stored JWT (browser only) to authenticated requests.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  return data?.data || data?.products || data || [];
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

export const getPolicies = async () => {
  const { data } = await api.get('/api/policies');
  return data?.data || data?.policies || data || [];
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
  return data?.data || data?.address || data;
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

export default api;
