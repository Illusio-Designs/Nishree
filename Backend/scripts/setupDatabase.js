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

export const setupDatabase = async () => {
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
            indexes: false
        };
        
        // Step 1a: Create base tables in specific order
        console.log('Step 1a: Creating base tables structure...');
        try {
            // First create independent tables (no foreign keys)
            const independentTables = [
                'User', 'Category', 'Attribute', 'AttributeValue',
                'ProductBadge', 'Coupon', 'ShippingFee', 'Settings',
                'SeoMetadata'
            ];

            for (const tableName of independentTables) {
                if (models[tableName]) {
                    console.log(`Creating ${tableName} table...`);
                    await models[tableName].sync(options);
                }
            }

            // Create Product table first
            if (models.Product) {
                console.log('Creating Product table...');
                await models.Product.sync(options);
            }

            // Create ProductVariation table
            if (models.ProductVariation) {
                console.log('Creating ProductVariation table...');
                await models.ProductVariation.sync(options);
            }

            // Create Product related tables that depend on Product
            const productDependentTables = [
                'ProductImage', 'ProductVariationAttribute',
                'ProductDiscount', 'ProductBadgeMapping', 'ProductSEO'
            ];

            for (const tableName of productDependentTables) {
                if (models[tableName]) {
                    console.log(`Creating ${tableName} table...`);
                    await models[tableName].sync(options);
                }
            }

            // Create Order related tables first
            const orderRelatedTables = [
                'Order', 'OrderItem', 'OrderStatusHistory',
                'Payment', 'ShippingAddress'
            ];

            for (const tableName of orderRelatedTables) {
                if (models[tableName]) {
                    console.log(`Creating ${tableName} table...`);
                    await models[tableName].sync(options);
                }
            }

            // Create Review table without foreign keys first
            if (models.Review) {
                console.log('Creating Review table without foreign keys...');
                const reviewAttributes = models.Review.getAttributes();
                const originalForeignKeys = {
                    userId: reviewAttributes.userId,
                    productId: reviewAttributes.productId,
                    orderId: reviewAttributes.orderId
                };

                // Temporarily remove foreign key constraints
                delete reviewAttributes.userId.references;
                delete reviewAttributes.productId.references;
                delete reviewAttributes.orderId.references;

                await models.Review.sync(options);

                // Restore foreign key constraints
                reviewAttributes.userId.references = originalForeignKeys.userId.references;
                reviewAttributes.productId.references = originalForeignKeys.productId.references;
                reviewAttributes.orderId.references = originalForeignKeys.orderId.references;
            }

            if (models.ReviewImage) {
                console.log('Creating ReviewImage table...');
                await models.ReviewImage.sync(options);
            }

            // Create Cart related tables
            if (models.Cart) {
                console.log('Creating Cart table...');
                await models.Cart.sync(options);
            }

            if (models.CartItem) {
                console.log('Creating CartItem table...');
                await models.CartItem.sync(options);
            }

            // Create Wishlist table
            if (models.Wishlist) {
                console.log('Creating Wishlist table...');
                await models.Wishlist.sync(options);
            }

            // Create Slider table
            if (models.Slider) {
                console.log('Creating Slider table...');
                await models.Slider.sync(options);
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
            
            // Step 2: Apply associations
            console.log('Step 2: Applying associations...');
            await import(`file://${path.join(__dirname, '..', 'model', 'associations.js')}`);
            
            // Step 3: Update tables with foreign keys and indexes
            console.log('Step 3: Updating tables with foreign keys and indexes...');
            
            // Add indexes to the products table
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
            });

            // Add indexes to other important tables
            const tablesToIndex = [
                { table: 'categories', columns: ['slug', 'status'] },
                { table: 'orders', columns: ['order_number', 'status'] },
                { table: 'users', columns: ['email', 'status'] },
                { table: 'product_variations', columns: ['sku', 'status'] },
                { table: 'reviews', columns: ['product_id', 'user_id'] }
            ];

            for (const { table, columns } of tablesToIndex) {
                for (const column of columns) {
                    await sequelize.query(`
                        ALTER TABLE ${table}
                        ADD INDEX idx_${table}_${column} (${column})
                    `).catch(err => {
                        console.log(`Index for ${table}.${column} might already exist, continuing...`);
                    });
                }
            }
            
            // Sync all tables with indexes
            console.log('Syncing all tables with indexes...');
            const indexOptions = { 
                hooks: false,
                alter: true
            };
            
            for (const modelName in models) {
                await models[modelName].sync(indexOptions);
            }
        } catch (error) {
            console.error('Error in table creation process:', error);
            throw error;
        }
        
        console.log('Database setup completed successfully!');
        return true;
    } catch (error) {
        console.error('Database setup failed:', error);
        throw error;
    }
}; 