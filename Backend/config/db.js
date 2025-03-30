const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: console.log,
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

        // Import all models and their associations
        require('../model/associations');

        // Drop all tables and recreate them
        await sequelize.sync({ force: true });
        console.log('Database tables recreated successfully.');

        // Log each table creation
        const models = [
            'User',
            'Category',
            'Slider',
            'Product',
            'ProductVariation',
            'Attribute',
            'AttributeValue',
            'ProductVariationAttribute',
            'ProductImage',
            'ProductSEO',
            'ProductBadge',
            'ProductBadgeMapping'
        ];

        models.forEach(model => {
            console.log(`Table ${model} created successfully.`);
        });

        // Now sync without force to prevent data loss in future
        await sequelize.sync({ force: false, alter: false });
        console.log('Database synchronized successfully.');
    } catch (error) {
        console.error('Database sync failed:', error);
        throw error; // Re-throw to handle in the application
    }
};

// Export sequelize instance directly
module.exports = sequelize;
