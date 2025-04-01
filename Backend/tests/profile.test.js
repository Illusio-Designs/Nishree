import request from 'supertest';
import { app } from '../index.js';
import { describe, test, expect, beforeAll } from '@jest/globals';

describe('User Profile Tests', () => {
    let userToken;
    const testUser = {
        username: 'profileuser',
        email: 'profile@example.com',
        password: 'test123'
    };

    beforeAll(async () => {
        // Register and login to get token
        await request(app)
            .post('/api/auth/register')
            .send(testUser);

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        userToken = loginResponse.body.token;
    });

    test('should get user profile', async () => {
        const response = await request(app)
            .get('/api/users/profile')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('email', testUser.email);
    });

    test('should update user profile', async () => {
        const updatedData = {
            username: 'updateduser',
            name: 'Updated Name'
        };

        const response = await request(app)
            .put('/api/users/profile')
            .set('Authorization', `Bearer ${userToken}`)
            .send(updatedData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('username', updatedData.username);
        expect(response.body).toHaveProperty('name', updatedData.name);
    });

    test('should not get profile without token', async () => {
        const response = await request(app)
            .get('/api/users/profile');

        expect(response.status).toBe(401);
    });

    test('should not update profile without token', async () => {
        const response = await request(app)
            .put('/api/users/profile')
            .send({ name: 'Test' });

        expect(response.status).toBe(401);
    });
}); 