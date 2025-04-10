import api from './index';

export const shippingAddressService = {
    getUserShippingAddresses: async () => {
        try {
            const response = await api.get('/api/shipping-addresses');
            return response.data.shippingAddresses;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getShippingAddressById: async (id) => {
        try {
            const response = await api.get(`/api/shipping-addresses/${id}`);
            return response.data.shippingAddress;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    createShippingAddress: async (addressData) => {
        try {
            const response = await api.post('/api/shipping-addresses', addressData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateShippingAddress: async (id, addressData) => {
        try {
            const response = await api.put(`/api/shipping-addresses/${id}`, addressData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteShippingAddress: async (id) => {
        try {
            const response = await api.delete(`/api/shipping-addresses/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default shippingAddressService;