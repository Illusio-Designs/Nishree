const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: console.log, // Enable logging to see SQL queries
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        }
    }
);

const testConnection = async () => {
    try {
        // First, try to connect without selecting a database
        const tempSequelize = new Sequelize('', process.env.DB_USER, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            dialect: process.env.DB_DIALECT || 'mysql',
            logging: false
        });

        // Create database if it doesn't exist with proper collation
        await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`);
        await tempSequelize.close();

        // Now connect to the specific database
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Explicitly require each model - this ensures they are loaded
        const User = require('../model/userModel');
        const Category = require('../model/categoryModel');
        const Slider = require('../model/sliderModel');
        const Product = require('../model/productModel');
        const ProductVariation = require('../model/productVariationModel');
        const Attribute = require('../model/attributeModel');
        const AttributeValue = require('../model/attributeValueModel');
        const ProductVariationAttribute = require('../model/productVariationAttributeModel');
        const ProductImage = require('../model/productImageModel');
        const ProductSEO = require('../model/productSEOModel');
        const ProductBadge = require('../model/productBadgeModel');
        const ProductBadgeMapping = require('../model/productBadgeMappingModel');
        const ProductDiscount = require('../model/productDiscountModel');
        const Coupon = require('../model/couponModel');
        const Wishlist = require('../model/wishlistModel');
        
        // New order management models
        const Order = require('../model/orderModel');
        const OrderItem = require('../model/orderItemModel');
        const ShippingAddress = require('../model/shippingAddressModel');
        const ShippingFee = require('../model/shippingFeeModel');
        const OrderStatusHistory = require('../model/orderStatusHistoryModel');
        const Payment = require('../model/paymentModel');

        // Explicitly log each model to verify it's loaded
        console.log("Models loaded:", 
            !!User, !!Category, !!Slider, !!Product, !!ProductVariation,
            !!Attribute, !!AttributeValue, !!ProductVariationAttribute,
            !!ProductImage, !!ProductSEO, !!ProductBadge, !!ProductBadgeMapping,
            !!ProductDiscount, !!Coupon, !!Wishlist,
            // New models
            !!Order, !!OrderItem, !!ShippingAddress, !!ShippingFee, !!OrderStatusHistory, !!Payment
        );

        // Then require associations after all models are loaded
        require('../model/associations');

        // Check existing tables before sync
        const [tables] = await sequelize.query('SHOW TABLES;');
        console.log('Existing tables before sync:', tables);

        // Sync all models with the database
        // Use { alter: true } instead of { force: true } to prevent data loss in production
        await sequelize.sync({ alter: true });
        console.log('Database tables synchronized successfully.');

        // Check tables after sync
        const [tablesAfter] = await sequelize.query('SHOW TABLES;');
        console.log('Tables after sync:', tablesAfter);

    } catch (error) {
        console.error('Database connection/sync failed:', error);
        // Log error but don't throw - this allows the app to start without DB
    }
};

// Export both sequelize instance and testConnection function
module.exports = sequelize;
module.exports.testConnection = testConnection;
