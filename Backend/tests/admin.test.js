import request from 'supertest';
import { app } from '../index.js';
import { describe, test, expect, beforeAll } from '@jest/globals';

describe('Admin Operations Tests', () => {
    let adminToken, userToken;
    const adminUser = {
        username: 'adminuser',
        email: 'admin@example.com',
        password: 'test123',
        role: 'admin'
    };
    const regularUser = {
        username: 'regularuser',
        email: 'user@example.com',
        password: 'test123'
    };

    beforeAll(async () => {
        // Register admin and get token
        const adminResponse = await request(app)
            .post('/api/auth/register')
            .send(adminUser);
        adminToken = adminResponse.body.token;

        // Register regular user and get token
        const userResponse = await request(app)
            .post('/api/auth/register')
            .send(regularUser);
        userToken = userResponse.body.token;
    });

    test('admin should get all users', async () => {
        const response = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('regular user should not get all users', async () => {
        const response = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
    });

    test('admin should get specific user', async () => {
        const response = await request(app)
            .get(`/api/users/${regularUser.email}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('email', regularUser.email);
    });

    test('regular user should not get specific user', async () => {
        const response = await request(app)
            .get(`/api/users/${adminUser.email}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
    });
}); 