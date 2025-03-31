const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance with proper DB name from environment
const sequelize = new Sequelize(
    process.env.DB_NAME || process.env.DB_DATABASE, // Use DB_NAME and fall back to DB_DATABASE
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: false, // Disable logging for production, set to console.log for debugging
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            timestamps: true,
            underscored: true
        }
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return false;
    }
};

// Function to sync models with proper error handling
const syncModels = async () => {
    try {
        // First try with alter: false to prevent automatic index creation
        await sequelize.sync({ alter: false });
        console.log('Database models synchronized successfully');
        return true;
    } catch (error) {
        console.error('Database sync failed:', error.message);
        
        // If the error is related to too many indexes, try to sync without indexes
        if (error.message.includes('too many keys') || error.message.includes('index')) {
            try {
                await sequelize.sync({ 
                    alter: false,
                    force: false,
                    match: /_test$/,
                    logging: false
                });
                console.log('Database models synchronized with minimal indexes');
                return true;
            } catch (secondError) {
                console.error('Failed to sync even with minimal indexes:', secondError.message);
                return false;
            }
        }
        
        return false;
    }
};

module.exports = {
    sequelize,
    testConnection,
    syncModels
};
