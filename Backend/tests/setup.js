import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectDB, syncDatabase } from '../config/db.js';
import { User } from '../model/userModel.js';
import { Settings } from '../model/settingsModel.js';
import { Category } from '../model/categoryModel.js';
import { Product } from '../model/productModel.js';
import { Order } from '../model/orderModel.js';
import { OrderItem } from '../model/orderItemModel.js';
import { OrderStatusHistory } from '../model/orderStatusHistoryModel.js';
import { Payment } from '../model/paymentModel.js';
import { Review } from '../model/reviewModel.js';
import { Slider } from '../model/sliderModel.js';
import { Coupon } from '../model/couponModel.js';
import { Wishlist } from '../model/wishlistModel.js';
import { ShippingAddress } from '../model/shippingAddressModel.js';
import { ShippingFee } from '../model/shippingFeeModel.js';
import { Seo } from '../model/seoModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set test environment
process.env.NODE_ENV = 'test';

let testAdminUser, testUser;

beforeAll(async () => {
    try {
        // Connect to the main database
        await connectDB();

        // Sync database to create tables
        await syncDatabase(true);

        // Create test users if they don't exist
        [testAdminUser] = await User.findOrCreate({
            where: { email: 'testadmin@example.com' },
            defaults: {
                username: 'testadmin',
                email: 'testadmin@example.com',
                password: await bcrypt.hash('test123', 10),
                role: 'admin',
                isActive: true
            }
        });

        [testUser] = await User.findOrCreate({
            where: { email: 'testuser@example.com' },
            defaults: {
                username: 'testuser',
                email: 'testuser@example.com',
                password: await bcrypt.hash('test123', 10),
                role: 'user',
                isActive: true
            }
        });

        // Generate JWT tokens for test users
        global.testAdminToken = jwt.sign(
            { id: testAdminUser.id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        global.testUserToken = jwt.sign(
            { id: testUser.id, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Create test settings
        await Settings.create({
            key: 'test_setting',
            value: 'test_value',
            description: 'Test setting for testing'
        });

        console.log('Test setup completed successfully');
    } catch (error) {
        console.error('Failed to set up test environment:', error);
        throw error;
    }
});

// Clean up test data after all tests
afterAll(async () => {
    try {
        // Remove all test data in the correct order
        await OrderStatusHistory.destroy({ where: {} });
        await OrderItem.destroy({ where: {} });
        await Order.destroy({ where: {} });
        await Payment.destroy({ where: {} });
        await Review.destroy({ where: {} });
        await Wishlist.destroy({ where: {} });
        await ShippingAddress.destroy({ where: {} });
        await ShippingFee.destroy({ where: {} });
        await Seo.destroy({ where: {} });
        await Slider.destroy({ where: {} });
        await Coupon.destroy({ where: {} });
        await Product.destroy({ where: {} });
        await Category.destroy({ where: {} });
        await Settings.destroy({ where: {} });
        await User.destroy({
            where: {
                email: ['testadmin@example.com', 'testuser@example.com']
            }
        });

        console.log('Test data cleaned up successfully');
    } catch (error) {
        console.error('Error cleaning up test data:', error);
    }
}); 