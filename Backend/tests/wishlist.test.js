import request from 'supertest';
import { app } from '../index.js';
import { createTestUser, createTestProduct, createTestCategory, cleanupTestData, getAuthHeader } from './helpers/testUtils.js';
import { Wishlist } from '../model/wishlistModel.js';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('Wishlist API Tests', () => {
    let regularUser;
    let testCategory;
    let testProduct;

    beforeAll(async () => {
        await cleanupTestData();
        regularUser = await createTestUser('user');
        testCategory = await createTestCategory();
        testProduct = await createTestProduct(testCategory.id);
    });

    afterAll(async () => {
        await cleanupTestData();
    });

    describe('Wishlist Operations', () => {
        test('should add product to wishlist', async () => {
            const response = await request(app)
                .post('/api/wishlist')
                .set(getAuthHeader(regularUser.token))
                .send({ productId: testProduct.id });

            expect(response.status).toBe(201);
            expect(response.body.productId).toBe(testProduct.id);
            expect(response.body.userId).toBe(regularUser.user.id);
        });

        test('should get user wishlist', async () => {
            const response = await request(app)
                .get('/api/wishlist')
                .set(getAuthHeader(regularUser.token));

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].productId).toBe(testProduct.id);
        });

        test('should check if product is in wishlist', async () => {
            const response = await request(app)
                .get(`/api/wishlist/check/${testProduct.id}`)
                .set(getAuthHeader(regularUser.token));

            expect(response.status).toBe(200);
            expect(response.body.inWishlist).toBeTruthy();
        });

        test('should remove product from wishlist', async () => {
            const response = await request(app)
                .delete(`/api/wishlist/${testProduct.id}`)
                .set(getAuthHeader(regularUser.token));

            expect(response.status).toBe(200);

            // Verify product is removed
            const checkResponse = await request(app)
                .get(`/api/wishlist/check/${testProduct.id}`)
                .set(getAuthHeader(regularUser.token));

            expect(checkResponse.body.inWishlist).toBeFalsy();
        });

        test('should clear wishlist', async () => {
            // First add a product
            await request(app)
                .post('/api/wishlist')
                .set(getAuthHeader(regularUser.token))
                .send({ productId: testProduct.id });

            // Then clear wishlist
            const response = await request(app)
                .delete('/api/wishlist')
                .set(getAuthHeader(regularUser.token));

            expect(response.status).toBe(200);

            // Verify wishlist is empty
            const wishlistResponse = await request(app)
                .get('/api/wishlist')
                .set(getAuthHeader(regularUser.token));

            expect(wishlistResponse.body).toHaveLength(0);
        });

        test('should not add same product twice', async () => {
            // Add product first time
            await request(app)
                .post('/api/wishlist')
                .set(getAuthHeader(regularUser.token))
                .send({ productId: testProduct.id });

            // Try to add same product again
            const response = await request(app)
                .post('/api/wishlist')
                .set(getAuthHeader(regularUser.token))
                .send({ productId: testProduct.id });

            expect(response.status).toBe(400);
        });

        test('should not add non-existent product', async () => {
            const response = await request(app)
                .post('/api/wishlist')
                .set(getAuthHeader(regularUser.token))
                .send({ productId: 99999 });

            expect(response.status).toBe(404);
        });

        test('should require authentication', async () => {
            const response = await request(app)
                .get('/api/wishlist');

            expect(response.status).toBe(401);
        });
    });
}); 