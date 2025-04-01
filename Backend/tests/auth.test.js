import request from 'supertest';
import { app } from '../index.js';
import { describe, test, expect, beforeAll } from '@jest/globals';

describe('Authentication Tests', () => {
    const testUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'test123'
    };

    test('should register a new user', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe(testUser.email);
    });

    test('should not register with existing email', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(response.status).toBe(400);
    });

    test('should login with correct credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe(testUser.email);
    });

    test('should not login with wrong password', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword'
            });

        expect(response.status).toBe(401);
    });

    test('should not login with non-existent email', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'test123'
            });

        expect(response.status).toBe(401);
    });
}); 