import api from './index';

export const paymentService = {
    getAllPayments: async () => {
        try {
            const response = await api.get('/api/payments');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getPaymentById: async (id) => {
        try {
            const response = await api.get(`/api/payments/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updatePaymentStatus: async (id, statusData) => {
        try {
            const response = await api.put(`/api/payments/${id}/status`, statusData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deletePayment: async (id) => {
        try {
            const response = await api.delete(`/api/payments/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default paymentService;