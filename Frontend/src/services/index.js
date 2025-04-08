import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
    }
    return config;
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

// Error handler
const handleApiError = (error) => {
    if (error.response) {
        throw error.response.data;
    } else if (error.request) {
        throw { message: 'No response from server' };
    } else {
        throw { message: error.message };
    }
};

// Auth Services
export const authService = {
    register: async (formData) => {
        try {
            const response = await api.post('/api/users/register', formData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    login: async (formData) => {
        try {
            const response = await api.post('/api/users/login', formData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            }
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    logout: async () => {
        try {
            const response = await api.post('/api/users/logout');
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            return response.data;
        } catch (error) {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            throw handleApiError(error);
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await api.post('/api/users/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    resetPassword: async (resetData) => {
        try {
            const response = await api.post('/api/users/reset-password', resetData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    googleAuth: () => {
        window.location.href = `${API_BASE_URL}/api/users/auth/google`;
    },

    googleAuthCallback: async () => {
        try {
            const response = await api.get('/api/users/auth/google/callback');
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};

// User Services
export const userService = {
    getCurrentUser: async () => {
        try {
            const response = await api.get('/api/users/me');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/api/users/profile');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/api/users/profile', profileData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    updateUser: async (formData) => {
        try {
            const response = await api.put('/api/users/update', formData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    changePassword: async (passwordData) => {
        try {
            const response = await api.put('/api/users/change-password', passwordData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    deleteUser: async () => {
        try {
            const response = await api.delete('/api/users/delete');
            localStorage.removeItem('token');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getAllUsers: async () => {
        try {
            const response = await api.get('/api/users/all');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};

// Category Services
export const categoryService = {
    createCategory: async (categoryData) => {
        try {
            const response = await api.post('/api/categories', categoryData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getAllCategories: async () => {
        try {
            const response = await api.get('/api/categories');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getCategoryById: async (id) => {
        try {
            const response = await api.get(`/api/categories/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    updateCategory: async (id, categoryData) => {
        try {
            const response = await api.put(`/api/categories/${id}`, categoryData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    deleteCategory: async (id) => {
        try {
            const response = await api.delete(`/api/categories/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};

// Product Services
export const productService = {
    createProduct: async (productData) => {
        try {
            const response = await api.post('/api/products', productData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getAllProducts: async () => {
        try {
            const response = await api.get('/api/products');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getProduct: async (id) => {
        try {
            const response = await api.get(`/api/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateProduct: async (id, productData) => {
        try {
            const response = await api.put(`/api/products/${id}`, productData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/api/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getProductsByCategory: async (categoryId) => {
        try {
            const response = await api.get(`/api/products/category/${categoryId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    searchProducts: async (query) => {
        try {
            const response = await api.get(`/api/products/search?query=${query}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

// Slider Services
export const sliderService = {
    createSlider: async (sliderData) => {
        try {
            const response = await api.post('/api/sliders', sliderData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getAllSliders: async () => {
        try {
            const response = await api.get('/api/sliders');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getSliderById: async (id) => {
        try {
            const response = await api.get(`/api/sliders/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    updateSlider: async (id, sliderData) => {
        try {
            const response = await api.put(`/api/sliders/${id}`, sliderData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    deleteSlider: async (id) => {
        try {
            const response = await api.delete(`/api/sliders/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};

export default api;