import api, { handleApiError } from './api';

// Create a new category
export const createCategory = async (categoryData) => {
    try {
        const response = await api.post('/api/categories', categoryData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Get all categories
export const getAllCategories = async () => {
    try {
        const response = await api.get('/api/categories');
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Get category by ID
export const getCategoryById = async (id) => {
    try {
        const response = await api.get(`/api/categories/${id}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Update a category
export const updateCategory = async (id, categoryData) => {
    try {
        const response = await api.put(`/api/categories/${id}`, categoryData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Delete a category
export const deleteCategory = async (id) => {
    try {
        const response = await api.delete(`/api/categories/${id}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}; 