import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get public categories
export const getPublicCategories = async () => {
    try {
        const response = await axios.get(`${API_URL}/public/categories`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get public sliders
export const getPublicSliders = async () => {
    try {
        const response = await axios.get(`${API_URL}/public/sliders`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
