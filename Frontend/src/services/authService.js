import api, { handleApiError } from './api';

// Authentication related API calls
export const register = async (formData) => {
    try {
        const response = await api.post('/api/users/register', formData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const login = async (formData) => {
    try {
        const response = await api.post('/api/users/login', formData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const logout = async () => {
    try {
        const response = await api.post('/api/users/logout');
        localStorage.removeItem('token');
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await api.post('/api/users/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const resetPassword = async (resetData) => {
    try {
        const response = await api.post('/api/users/reset-password', resetData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const verifyEmail = async (token) => {
    try {
        const response = await api.get(`/api/users/verify-email/${token}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const googleAuth = () => {
    window.location.href = `${api.defaults.baseURL}/api/users/auth/google`;
};

export const googleAuthCallback = async () => {
    try {
        const response = await api.get('/api/users/auth/google/callback');
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};