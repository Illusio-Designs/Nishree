import { api } from "./api";

export const couponService = {
  getAllCoupons: async () => {
    const response = await api.get("/coupons");
    return response.data;
  },

  getCouponById: async (id) => {
    const response = await api.get(`/coupons/${id}`);
    return response.data;
  },

  createCoupon: async (couponData) => {
    const response = await api.post("/coupons", couponData);
    return response.data;
  },

  updateCoupon: async (id, couponData) => {
    const response = await api.put(`/coupons/${id}`, couponData);
    return response.data;
  },

  deleteCoupon: async (id) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },

  validateCoupon: async (code, userId) => {
    const response = await api.post("/coupons/validate", { code, userId });
    return response.data;
  },

  applyCoupon: async (code, userId, amount) => {
    const response = await api.post("/coupons/apply", { code, userId, amount });
    return response.data;
  },

  getUserCouponHistory: async (userId) => {
    const response = await api.get(`/coupons/user/${userId}`);
    return response.data;
  }
}; 