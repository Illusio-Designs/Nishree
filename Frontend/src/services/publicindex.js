import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/';

// Get public categories
export const getPublicCategories = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/categories/public/categories`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get public sliders
export const getPublicSliders = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/sliders/public/sliders`);
        console.log('Public Sliders Response:', response.data);
        return response.data.sliders || response.data; // Handle both response formats
    } catch (error) {
        console.error('Error fetching public sliders:', error);
        throw error.response?.data || error.message;
    }
};
