import request from 'supertest';
import { app } from '../index.js';
import { createTestUser, createTestToken } from './helpers/testUtils.js';
import { Settings } from '../model/settingsModel.js';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('Settings API Tests', () => {
    let adminUser;
    let regularUser;
    let adminToken;
    let regularToken;
    let testSetting;

    beforeAll(async () => {
        adminUser = await createTestUser('admin');
        regularUser = await createTestUser('user');
        adminToken = createTestToken(adminUser);
        regularToken = createTestToken(regularUser);

        // Create a test setting
        testSetting = await Settings.create({
            key: 'test_setting',
            value: 'test_value',
            description: 'Test setting for testing'
        });
    });

    describe('GET /api/settings', () => {
        test('should get all settings when authenticated as admin', async () => {
            const response = await request(app)
                .get('/api/settings')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        });

        test('should return 401 when not authenticated', async () => {
            const response = await request(app)
                .get('/api/settings');

            expect(response.status).toBe(401);
        });

        test('should return 403 when authenticated as regular user', async () => {
            const response = await request(app)
                .get('/api/settings')
                .set('Authorization', `Bearer ${regularToken}`);

            expect(response.status).toBe(403);
        });
    });

    describe('GET /api/settings/:key', () => {
        test('should get specific setting when authenticated as admin', async () => {
            const response = await request(app)
                .get(`/api/settings/${testSetting.key}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.key).toBe(testSetting.key);
            expect(response.body.value).toBe(testSetting.value);
        });

        test('should return 404 for non-existent setting', async () => {
            const response = await request(app)
                .get('/api/settings/non_existent_setting')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
        });

        test('should return 401 when not authenticated', async () => {
            const response = await request(app)
                .get(`/api/settings/${testSetting.key}`);

            expect(response.status).toBe(401);
        });
    });

    describe('PUT /api/settings/:key', () => {
        test('should update setting when authenticated as admin', async () => {
            const newValue = 'updated_test_value';
            const response = await request(app)
                .put(`/api/settings/${testSetting.key}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ value: newValue });

            expect(response.status).toBe(200);
            expect(response.body.setting.value).toBe(newValue);
        });

        test('should handle encrypted settings', async () => {
            const encryptedSetting = await Settings.create({
                key: 'encrypted_setting',
                value: 'sensitive_value',
                description: 'Encrypted setting for testing',
                isEncrypted: true
            });

            const newValue = 'new_sensitive_value';
            const response = await request(app)
                .put(`/api/settings/${encryptedSetting.key}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ value: newValue });

            expect(response.status).toBe(200);

            // Verify the value is encrypted in the database
            const updatedSetting = await Settings.findOne({ where: { key: encryptedSetting.key } });
            expect(updatedSetting.value).not.toBe(newValue);
            expect(updatedSetting.value).not.toBe(encryptedSetting.value);
        });

        test('should return 404 for non-existent setting', async () => {
            const response = await request(app)
                .put('/api/settings/non_existent_setting')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ value: 'test' });

            expect(response.status).toBe(404);
        });

        test('should return 401 when not authenticated', async () => {
            const response = await request(app)
                .put(`/api/settings/${testSetting.key}`)
                .send({ value: 'test' });

            expect(response.status).toBe(401);
        });

        test('should return 403 when authenticated as regular user', async () => {
            const response = await request(app)
                .put(`/api/settings/${testSetting.key}`)
                .set('Authorization', `Bearer ${regularToken}`)
                .send({ value: 'test' });

            expect(response.status).toBe(403);
        });
    });
}); 