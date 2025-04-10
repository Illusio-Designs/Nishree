import api from './index';

export const shippingFeeService = {
    getAllShippingFees: async () => {
        try {
            const response = await api.get('/api/shipping-fees');
            return response.data.shippingFees;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getShippingFeeByType: async (type) => {
        try {
            const response = await api.get(`/api/shipping-fees/${type}`);
            return response.data.shippingFee;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    createOrUpdateShippingFee: async (feeData) => {
        try {
            const response = await api.post('/api/shipping-fees', feeData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteShippingFee: async (id) => {
        try {
            const response = await api.delete(`/api/shipping-fees/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default shippingFeeService;