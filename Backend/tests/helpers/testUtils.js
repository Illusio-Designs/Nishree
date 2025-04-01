import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../model/userModel.js';
import { Category } from '../../model/categoryModel.js';
import { Product } from '../../model/productModel.js';
import { sequelize } from '../../config/db.js';
import { Op } from 'sequelize';

export const createTestUser = async (role = 'user') => {
    const user = await User.create({
        username: `test${role}${Date.now()}`,
        email: `test${role}${Date.now()}@example.com`,
        password: await bcrypt.hash('test123', 10),
        role,
        isActive: true
    });

    const token = jwt.sign(
        { id: user.id, role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return { user, token };
};

export const createTestCategory = async () => {
    return await Category.create({
        name: `Test Category ${Date.now()}`,
        description: 'Test category description'
    });
};

export const createTestProduct = async (categoryId) => {
    return await Product.create({
        name: `Test Product ${Date.now()}`,
        description: 'Test product description',
        price: 99.99,
        stock: 100,
        category_id: categoryId
    });
};

export const cleanupTestData = async () => {
    await User.destroy({
        where: {
            email: {
                [Op.like]: 'test%@example.com'
            }
        }
    });
    await Category.destroy({
        where: {
            name: {
                [Op.like]: 'Test Category%'
            }
        }
    });
    await Product.destroy({
        where: {
            name: {
                [Op.like]: 'Test Product%'
            }
        }
    });
};

export const getAuthHeader = (token) => ({
    'Authorization': `Bearer ${token}`
});

// These functions are kept for compatibility but now just log messages
export const setupTestDatabase = async () => {
    console.log('Using main database for tests');
};

export const cleanupTestDatabase = async () => {
    await cleanupTestData();
}; 