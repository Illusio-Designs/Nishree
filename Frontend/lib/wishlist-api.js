import api from '@/lib/api';

// Full wishlist products (for the wishlist page).
export const getWishlist = async () => {
  try {
    const { data } = await api.get('/api/wishlist');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

// Just the saved product ids (to light up hearts).
export const getWishlistIds = async () => {
  try {
    const { data } = await api.get('/api/wishlist/ids');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const addToWishlist = async (productId) => (await api.post('/api/wishlist', { product_id: productId })).data;
export const removeFromWishlist = async (productId) => (await api.delete(`/api/wishlist/${productId}`)).data;
