import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Add token to axios requests
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle API errors
const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error
        throw error.response.data;
    } else if (error.request) {
        // Request made but no response
        throw { message: 'No response from server' };
    } else {
        // Error in request configuration
        throw { message: error.message };
    }
};

export const register = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/users/register`, formData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const login = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/users/login`, formData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const forgotPassword = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/users/forgot-password`, formData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const uploadProfilePic = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/users/upload-profile-pic`, formData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const googleAuth = async () => {
    try {
        // First authenticate with Google
        const response = await axios.get(`${API_BASE_URL}/api/users/auth/google`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const googleAuthCallback = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/users/auth/google/callback`);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            return response.data;
        }
        throw new Error('No token received');
    } catch (error) {
        throw handleApiError(error);
    }
};

export const logout = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/users/logout`);
        localStorage.removeItem('token');
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getUser = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/users/getUser`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};