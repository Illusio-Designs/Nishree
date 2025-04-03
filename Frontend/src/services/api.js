import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const handleApiError = (error) => {
    if (error.response) {
        throw error.response.data;
    } else if (error.request) {
        throw { message: 'No response from server' };
    } else {
        throw { message: error.message };
    }
};

export default api;