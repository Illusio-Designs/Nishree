import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/';

// Authentication APIs
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/api/users/register`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/api/users/login`, credentials);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/api/users/forgot-password`, { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const resetPassword = async (resetData) => {
    try {
        const response = await axios.post(`${API_URL}/api/users/reset-password`, resetData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get public categories
export const getPublicCategories = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/categories/public/categories`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get public category by ID
export const getPublicCategoryById = async (categoryId) => {
    try {
        const response = await axios.get(`${API_URL}/api/categories/public/categories/${categoryId}`);
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
