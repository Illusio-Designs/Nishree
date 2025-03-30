const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false,
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timestamps: true
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Test the connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Sync with alter: true to allow table modifications
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully with alterations.');
    } catch (error) {
        console.error('Database sync failed:', error);
    }
};

testConnection();

module.exports = sequelize;
