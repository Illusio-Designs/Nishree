import { Settings } from '../model/settingsModel.js';
import crypto from 'crypto';

// Encryption key for sensitive data
const ENCRYPTION_KEY = process.env.JWT_SECRET || 'your-fallback-secret';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Helper function to encrypt sensitive data
const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Helper function to decrypt sensitive data
const decrypt = (text) => {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

// Get all settings
export const getAllSettings = async (req, res) => {
    try {
        const settings = await Settings.findAll();
        res.json(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ message: 'Error getting settings' });
    }
};

// Get setting by key
export const getSettingByKey = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await Settings.findOne({ where: { key } });

        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        res.json(setting);
    } catch (error) {
        console.error('Get setting error:', error);
        res.status(500).json({ message: 'Error getting setting' });
    }
};

// Create or update setting
export const upsertSetting = async (req, res) => {
    try {
        const { key, value, is_encrypted, description } = req.body;

        const [setting, created] = await Settings.findOrCreate({
            where: { key },
            defaults: { value, is_encrypted, description }
        });

        if (!created) {
            await setting.update({ value, is_encrypted, description });
        }

        res.json({
            message: created ? 'Setting created successfully' : 'Setting updated successfully',
            setting
        });
    } catch (error) {
        console.error('Upsert setting error:', error);
        res.status(500).json({ message: 'Error upserting setting' });
    }
};

// Delete setting
export const deleteSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await Settings.findOne({ where: { key } });

        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        await setting.destroy();
        res.json({ message: 'Setting deleted successfully' });
    } catch (error) {
        console.error('Delete setting error:', error);
        res.status(500).json({ message: 'Error deleting setting' });
    }
};

// Initialize default settings
export const initializeSettings = async () => {
    try {
        const defaultSettings = [
            {
                key: 'GA_MEASUREMENT_ID',
                value: process.env.GA_MEASUREMENT_ID || '',
                description: 'Google Analytics Measurement ID',
                is_encrypted: false
            },
            {
                key: 'GA_API_SECRET',
                value: process.env.GA_API_SECRET || '',
                description: 'Google Analytics API Secret',
                is_encrypted: true
            },
            {
                key: 'FB_PIXEL_ID',
                value: process.env.FB_PIXEL_ID || '',
                description: 'Facebook Pixel ID',
                is_encrypted: false
            },
            {
                key: 'FB_ACCESS_TOKEN',
                value: process.env.FB_ACCESS_TOKEN || '',
                description: 'Facebook Access Token',
                is_encrypted: true
            }
        ];

        for (const setting of defaultSettings) {
            await Settings.findOrCreate({
                where: { key: setting.key },
                defaults: setting
            });
        }

        console.log('Settings initialized successfully');
    } catch (error) {
        console.error('Error initializing settings:', error);
    }
}; 