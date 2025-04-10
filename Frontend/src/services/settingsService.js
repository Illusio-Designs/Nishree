import api from './index';

export const settingsService = {
    getAllSettings: async () => {
        try {
            const response = await api.get('/api/settings');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getSettingByKey: async (key) => {
        try {
            const response = await api.get(`/api/settings/${key}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    upsertSetting: async (settingData) => {
        try {
            const response = await api.post('/api/settings', settingData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteSetting: async (key) => {
        try {
            const response = await api.delete(`/api/settings/${key}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default settingsService;