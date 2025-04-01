import request from 'supertest';
import { app } from '../index.js';
import { createTestUser, getAuthHeader } from './helpers/testUtils.js';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('User API Tests', () => {
    let adminUser, regularUser;

    beforeAll(async () => {
        adminUser = await createTestUser('admin');
        regularUser = await createTestUser('user');
    });

    describe('Authentication', () => {
        test('should register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'newuser',
                    email: 'newuser@example.com',
                    password: 'test123'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
        });

        test('should login existing user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: regularUser.user.email,
                    password: 'test123'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });

        test('should not login with wrong password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: regularUser.user.email,
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('User Management', () => {
        test('should get user profile', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .set(getAuthHeader(regularUser.token));

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id');
            expect(response.body.email).toBe(regularUser.user.email);
        });

        test('should update user profile', async () => {
            const response = await request(app)
                .put('/api/users/profile')
                .set(getAuthHeader(regularUser.token))
                .send({
                    name: 'Updated Name'
                });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Updated Name');
        });

        test('admin should get all users', async () => {
            const response = await request(app)
                .get('/api/users')
                .set(getAuthHeader(adminUser.token));

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        });

        test('regular user should not get all users', async () => {
            const response = await request(app)
                .get('/api/users')
                .set(getAuthHeader(regularUser.token));

            expect(response.status).toBe(403);
        });
    });

    describe('Password Management', () => {
        test('should request password reset', async () => {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({
                    email: regularUser.user.email
                });

            expect(response.status).toBe(200);
        });

        test('should change password', async () => {
            const response = await request(app)
                .put('/api/auth/change-password')
                .set(getAuthHeader(regularUser.token))
                .send({
                    currentPassword: 'test123',
                    newPassword: 'newpassword123'
                });

            expect(response.status).toBe(200);
        });
    });
}); 