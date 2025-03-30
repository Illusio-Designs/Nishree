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

        // Explicitly log each model to verify it's loaded
        console.log("Models loaded:", 
            !!User, !!Category, !!Slider, !!Product, !!ProductVariation,
            !!Attribute, !!AttributeValue, !!ProductVariationAttribute,
            !!ProductImage, !!ProductSEO, !!ProductBadge, !!ProductBadgeMapping
        );

        // Then require associations after all models are loaded
        require('../model/associations');

        // Check existing tables before sync
        const [tables] = await sequelize.query('SHOW TABLES;');
        console.log('Existing tables before sync:', tables);

        // Drop all tables and recreate them
        await sequelize.sync({ force: true });
        console.log('Database tables recreated successfully.');

        // Check tables after sync
        const [tablesAfter] = await sequelize.query('SHOW TABLES;');
        console.log('Tables after sync:', tablesAfter);

        // Log each expected table
        const expectedTables = [
            'users',
            'categories',
            'sliders',
            'products',
            'product_variations',
            'attributes',
            'attribute_values',
            'product_variation_attributes',
            'product_images',
            'product_seo',
            'product_badges',
            'product_badge_mappings'
        ];

        // Check which tables exist
        for (const table of expectedTables) {
            const [result] = await sequelize.query(`SHOW TABLES LIKE '${table}';`);
            console.log(`Table '${table}' exists:`, result.length > 0);
        }

    } catch (error) {
        console.error('Database sync failed:', error);
        throw error; // Re-throw to handle in the application
    }
};

// Export both sequelize instance and testConnection function
module.exports = sequelize;
module.exports.testConnection = testConnection;
