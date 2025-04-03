import api, { handleApiError } from './api';

// User related API calls
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/api/users/me');
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getProfile = async () => {
    try {
        const response = await api.get('/api/users/profile');
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateProfile = async (profileData) => {
    try {
        const response = await api.put('/api/users/profile', profileData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateUser = async (formData) => {
    try {
        const response = await api.put('/api/users/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const changePassword = async (passwordData) => {
    try {
        const response = await api.put('/api/users/change-password', passwordData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updatePassword = async (passwordData) => {
    try {
        const response = await api.put('/api/users/update-password', passwordData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteUser = async () => {
    try {
        const response = await api.delete('/api/users/delete');
        localStorage.removeItem('token');
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getAllUsers = async () => {
    try {
        const response = await api.get('/api/users/all');
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};