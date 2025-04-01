import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createTestDatabase = async () => {
    try {
        // Create connection without database name
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        // Create test database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS nishree_test');
        console.log('Test database created successfully');

        // Close connection
        await connection.end();
    } catch (error) {
        console.error('Error creating test database:', error);
        process.exit(1);
    }
};

createTestDatabase(); 