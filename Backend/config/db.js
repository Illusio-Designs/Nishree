import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: {
            charset: 'utf8mb4'
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
};

const syncDatabase = async (force = false) => {
    try {
        if (force) {
            // Drop tables in the correct order to handle foreign key constraints
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
            await sequelize.sync({ force: true });
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        } else {
            await sequelize.sync();
        }
        console.log('Database synchronized successfully.');
    } catch (error) {
        console.error('Unable to sync database:', error);
        throw error;
    }
};

export {
    sequelize,
    connectDB,
    syncDatabase
};