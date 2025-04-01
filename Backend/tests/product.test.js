import request from 'supertest';
import { app } from '../index.js';
import { createTestUser, createTestToken } from './helpers/testUtils.js';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('Product and Category API Tests', () => {
    let adminUser;
    let regularUser;
    let adminToken;
    let regularToken;
    let testCategory;

    beforeAll(async () => {
        adminUser = await createTestUser('admin');
        regularUser = await createTestUser('user');
        adminToken = createTestToken(adminUser);
        regularToken = createTestToken(regularUser);
    });

    describe('Category Management', () => {
        test('admin should create category', async () => {
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Test Category',
                    description: 'Test Category Description'
                });

            expect(response.status).toBe(201);
            testCategory = response.body;
            expect(testCategory).toHaveProperty('id');
            expect(testCategory.name).toBe('Test Category');
        });

        test('should get all categories', async () => {
            const response = await request(app)
                .get('/api/categories');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        });

        test('admin should update category', async () => {
            const response = await request(app)
                .put(`/api/categories/${testCategory.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Updated Category',
                    description: 'Updated Description'
                });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Updated Category');
        });

        test('regular user should not create category', async () => {
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${regularToken}`)
                .send({
                    name: 'Unauthorized Category',
                    description: 'This should fail'
                });

            expect(response.status).toBe(403);
        });
    });

    describe('Product Management', () => {
        test('admin should create product', async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Test Product',
                    description: 'Test Product Description',
                    price: 99.99,
                    categoryId: testCategory.id,
                    stock: 100
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe('Test Product');
        });

        test('should get all products', async () => {
            const response = await request(app)
                .get('/api/products');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        });

        test('should get product by id', async () => {
            const response = await request(app)
                .get('/api/products/1');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id');
        });

        test('admin should update product', async () => {
            const response = await request(app)
                .put('/api/products/1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Updated Product',
                    price: 149.99
                });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Updated Product');
            expect(response.body.price).toBe(149.99);
        });

        test('should search products', async () => {
            const response = await request(app)
                .get('/api/products/search?q=Updated');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBeGreaterThan(0);
        });

        test('should filter products by category', async () => {
            const response = await request(app)
                .get(`/api/products?categoryId=${testCategory.id}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBeGreaterThan(0);
        });

        test('regular user should not create product', async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${regularToken}`)
                .send({
                    name: 'Unauthorized Product',
                    description: 'This should fail',
                    price: 99.99,
                    categoryId: testCategory.id,
                    stock: 100
                });

            expect(response.status).toBe(403);
        });
    });
}); 