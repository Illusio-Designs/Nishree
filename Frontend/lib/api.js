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
  if (/^https?:\/\//i.test(path)) return path;
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
  return data?.data || data?.product || data;
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

/* -------------------------------- Auth -------------------------------- */

export const login = async (credentials) => {
  const { data } = await api.post('/api/users/login', credentials);
  return data;
};

export const register = async (payload) => {
  const { data } = await api.post('/api/users/register', payload);
  return data;
};

export default api;
