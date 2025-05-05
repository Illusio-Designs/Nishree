import 'dotenv/config';
import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME,
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

const setupDatabase = async () => {
    try {
        // First, try to connect without selecting a database
        const tempSequelize = new Sequelize('', process.env.DB_USER, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            dialect: process.env.DB_DIALECT || 'mysql',
            logging: false
        });

        // Create database if it doesn't exist with proper collation
        await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || process.env.DB_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`);
        await tempSequelize.close();

        // Now connect to the specific database
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Step 1: Creating tables without foreign key constraints
        console.log('Step 1: Creating tables without foreign key constraints...');
        
        // Load models from model directory
        const modelDir = path.join(__dirname, '..', 'model');
        const modelFiles = fs.readdirSync(modelDir)
            .filter(file => file.endsWith('Model.js'));
        
        // Load all models
        const models = {};
        for (const file of modelFiles) {
            const modelPath = `file://${path.join(modelDir, file)}`;
            const modelModule = await import(modelPath);
            // Get the model name from the file name (e.g., 'productModel.js' -> 'Product')
            const modelName = file.charAt(0).toUpperCase() + file.slice(1).replace('Model.js', '');
            // Get the exported model using the model name
            const model = modelModule[modelName];
            if (model) {
                console.log(`Loaded model: ${modelName}`);
                models[modelName] = model;
            } else {
                console.log(`Failed to load model: ${modelName}`);
                console.log('Available exports:', Object.keys(modelModule));
            }
        }
        
        // Create tables without foreign keys
        const options = { 
            hooks: false,
            alter: true,
            // Disable adding indexes for now
            indexes: false
        };
        
        // Step 1a: First create base tables with just the columns (no foreign keys or indexes)
        console.log('Step 1a: Creating base tables structure...');
        try {
            // Create tables in a specific order
            if (models.User) await models.User.sync(options);
            if (models.Category) await models.Category.sync(options);
            if (models.Order) await models.Order.sync(options);
            if (models.Review) await models.Review.sync(options);
            
            // Create Product table but modify it first to remove the featured_review_id temporarily
            if (models.Product) {
                console.log('Creating Product table without featured_review_id...');
                const productAttributes = models.Product.getAttributes();
                const originalFeaturedReviewId = productAttributes.featured_review_id;
                delete productAttributes.featured_review_id;
                await models.Product.sync(options);
                
                // Add back the attribute for later use
                models.Product.rawAttributes.featured_review_id = originalFeaturedReviewId;
            }
            
            // Then create other tables
            for (const modelName in models) {
                if (!['User', 'Category', 'Product', 'Order', 'Review'].includes(modelName)) {
                    await models[modelName].sync(options);
                }
            }
            
            // Add comparePrice column to product_variations table if it doesn't exist
            console.log('Adding comparePrice column to product_variations table...');
            await sequelize.query(`
                ALTER TABLE product_variations 
                ADD COLUMN IF NOT EXISTS comparePrice DECIMAL(10,2) NULL,
                ADD COLUMN IF NOT EXISTS attributes JSON NOT NULL DEFAULT ('{}')
            `).catch(err => {
                console.log('Note: Some columns might already exist, continuing...');
            });
            
            // Step 1b: Now manually add the featured_review_id column to products table
            console.log('Step 1b: Adding featured_review_id column to products table...');
            await sequelize.query(`
                ALTER TABLE products 
                ADD COLUMN featured_review_id INT NULL,
                ADD CONSTRAINT fk_products_featured_review
                FOREIGN KEY (featured_review_id) REFERENCES reviews(id)
                ON DELETE SET NULL ON UPDATE CASCADE
            `).catch(err => {
                console.log('Note: featured_review_id column might already exist, continuing...');
            });
            
            // Step 2: Apply associations
            console.log('Step 2: Applying associations...');
            await import(`file://${path.join(__dirname, '..', 'model', 'associations.js')}`);
            
            // Step 3: Update tables with foreign keys and indexes
            console.log('Step 3: Updating tables with foreign keys and indexes...');
            
            // Add indexes to the products table manually
            console.log('Adding indexes to products table...');
            await sequelize.query(`
                ALTER TABLE products 
                ADD INDEX idx_products_slug (slug),
                ADD INDEX idx_products_status (status),
                ADD INDEX idx_products_avg_rating (avg_rating),
                ADD INDEX idx_products_review_count (review_count),
                ADD INDEX idx_products_featured_review_id (featured_review_id)
            `).catch(err => {
                console.log('Some indexes might already exist, continuing...');
                console.error(err);
            });
            
            // Sync other tables with indexes
            console.log('Syncing remaining tables with indexes...');
            const indexOptions = { 
                hooks: false,
                alter: true
            };
            
            for (const modelName in models) {
                if (modelName !== 'Product') {
                    await models[modelName].sync(indexOptions);
                }
            }
        } catch (error) {
            console.error('Error in table creation process:', error);
            throw error;
        }
        
        console.log('Database setup completed successfully!');
    } catch (error) {
        console.error('Database setup failed:', error);
    }
};

// Execute the setup function
setupDatabase().then(() => {
    console.log('Database setup script completed.');
    process.exit(0);
}).catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
}); 