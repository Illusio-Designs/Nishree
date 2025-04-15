import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create connection for main database
const createDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}`);
        console.log('Main database created successfully');

        await connection.end();
    } catch (error) {
        console.error('Error creating main database:', error);
        process.exit(1);
    }
};

// Convert a file path to a proper file:// URL for ESM imports
const pathToFileURL = (filePath) => {
    // Handle Windows paths by replacing backslashes with forward slashes
    let normalizedPath = filePath.replace(/\\/g, '/');
    
    // Ensure the path starts with a leading slash for absolute paths
    if (!normalizedPath.startsWith('/')) {
        normalizedPath = '/' + normalizedPath;
    }
    
    // Format as a proper file:// URL, ensuring it's properly encoded
    return `file://${normalizedPath}`;
};

// Setup Sequelize instance and database schema
const setupDatabase = async () => {
    const sequelize = new Sequelize(
        process.env.DB_DATABASE,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: process.env.DB_DIALECT || 'mysql',
            logging: false, // Set to console.log if you want SQL queries logged
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

    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Load models and create tables
        const modelDir = path.join(__dirname, '..', 'model');
        console.log(`Model directory: ${modelDir}`);
        
        // Check if directory exists before reading
        if (!fs.existsSync(modelDir)) {
            throw new Error(`Model directory does not exist: ${modelDir}`);
        }
        
        const modelFiles = fs.readdirSync(modelDir).filter(file => file.endsWith('Model.js'));
        console.log(`Found model files: ${modelFiles.join(', ')}`);
        
        const models = {};
        
        // Use dynamic imports with proper file:// URLs for ESM
        for (const file of modelFiles) {
            const modelPath = path.join(modelDir, file);
            const modelUrl = pathToFileURL(modelPath);
            console.log(`Importing model from: ${modelUrl}`);
            
            try {
                const modelModule = await import(modelUrl);
                const model = modelModule.default || modelModule;
                
                // Try to determine the model name from various possible patterns
                let modelName;
                
                if (model && model.name) {
                    // Case 1: Model has a direct name property
                    modelName = model.name;
                } else if (model && model.tableName) {
                    // Case 2: Model has a tableName property
                    modelName = model.tableName;
                } else if (model && typeof model === 'function' && model.prototype && model.prototype.constructor.name) {
                    // Case 3: Model is a constructor/class
                    modelName = model.prototype.constructor.name;
                } else if (model && typeof model.getTableName === 'function') {
                    // Case 4: Model has a getTableName method
                    modelName = model.getTableName();
                } else {
                    // Case 5: Use filename as fallback
                    modelName = file.replace('Model.js', '');
                    // Capitalize first letter
                    modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
                }
                
                models[modelName] = model;
                console.log(`Successfully registered model: ${modelName}`);
            } catch (importError) {
                console.error(`Error importing model ${file}:`, importError);
                // Continue with other models instead of failing completely
            }
        }

        // Sync models
        for (const modelName in models) {
            try {
                const model = models[modelName];
                
                // Check if model has sync method directly
                if (typeof model.sync === 'function') {
                    await model.sync({ alter: true });
                } 
                // Check if model is a Sequelize model class
                else if (model && model.init && typeof model.init === 'function') {
                    // Initialize the model if it's not already
                    if (!model.sequelize) {
                        model.init(sequelize);
                    }
                    await model.sync({ alter: true });
                }
                // Handle case where model might be exported in a different structure
                else if (model && model.model && typeof model.model.sync === 'function') {
                    await model.model.sync({ alter: true });
                }
                
                console.log(`Synced model: ${modelName}`);
            } catch (syncError) {
                console.error(`Error syncing model ${modelName}:`, syncError);
            }
        }

        console.log('Database setup completed successfully!');
    } catch (error) {
        console.error('Database setup failed:', error);
        throw error;
    }
};

// Execute the functions
const runSetup = async () => {
    try {
        await createDatabase();
        await setupDatabase();
        console.log('Database setup script completed.');
        process.exit(0);
    } catch (error) {
        console.error('Script execution failed:', error);
        process.exit(1);
    }
};

runSetup();