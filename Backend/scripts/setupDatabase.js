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
        
        // Step 1a: Create base tables in specific order
        console.log('Step 1a: Creating base tables structure...');
        try {
            // First create independent tables (no foreign keys)
            const independentTables = [
                'User', 'AttributeValue',
                'ShippingFee', 'SeoMetadata'
            ];

            // Create tables without indexes first
            const noIndexOptions = { 
                hooks: false,
                alter: true,
                indexes: false
            };

            for (const tableName of independentTables) {
                if (models[tableName]) {
                    console.log(`Creating ${tableName} table without indexes...`);
                    await models[tableName].sync(noIndexOptions);
                }
            }

            // Create Settings table without additional indexes
            if (models.Settings) {
                console.log('Creating Settings table...');
                await models.Settings.sync({
                    hooks: false,
                    alter: true
                });
            }

            // Create Attribute table separately with minimal indexes
            if (models.Attribute) {
                console.log('Creating Attribute table with minimal indexes...');
                await models.Attribute.sync({
                    hooks: false,
                    alter: true,
                    indexes: [
                        {
                            unique: true,
                            fields: ['name']
                        }
                    ]
                });
            }

            // Create Category table separately with minimal indexes
            if (models.Category) {
                console.log('Creating Category table with minimal indexes...');
                await models.Category.sync({
                    hooks: false,
                    alter: true,
                    indexes: [
                        {
                            unique: true,
                            fields: ['slug']
                        }
                    ]
                });
            }

            // Create Coupon table separately with minimal indexes
            if (models.Coupon) {
                console.log('Creating Coupon table with minimal indexes...');
                await models.Coupon.sync({
                    hooks: false,
                    alter: true,
                    indexes: [
                        {
                            unique: true,
                            fields: ['code']
                        }
                    ]
                });
            }

            // Create Product table separately with minimal indexes
            if (models.Product) {
                console.log('Creating Product table with minimal indexes...');
                await models.Product.sync({
                    hooks: false,
                    alter: true,
                    indexes: [
                        {
                            unique: true,
                            fields: ['slug']
                        }
                    ]
                });
            }

            // Create ProductVariation table
            if (models.ProductVariation) {
                console.log('Creating ProductVariation table without indexes...');
                await models.ProductVariation.sync(noIndexOptions);
            }

            // Create Product related tables that depend on Product
            const productDependentTables = [
                'ProductImage', 'ProductSEO'
            ];

            for (const tableName of productDependentTables) {
                if (models[tableName]) {
                    console.log(`Creating ${tableName} table without indexes...`);
                    await models[tableName].sync(noIndexOptions);
                }
            }

            // Create Order related tables in correct order
            console.log('Creating Order related tables without indexes...');
            
            // First create Order table
            if (models.Order) {
                console.log('Creating Order table without indexes...');
                await models.Order.sync(noIndexOptions);
            }

            // Then create tables that depend on Order
            const orderDependentTables = [
                'OrderItem', 'OrderStatusHistory',
                'Payment', 'ShippingAddress'
            ];

            for (const tableName of orderDependentTables) {
                if (models[tableName]) {
                    console.log(`Creating ${tableName} table without indexes...`);
                    await models[tableName].sync(noIndexOptions);
                }
            }

            // Create Review table without foreign keys first
            if (models.Review) {
                console.log('Creating Review table without indexes...');
                await models.Review.sync(noIndexOptions);
            }

            if (models.ReviewImage) {
                console.log('Creating ReviewImage table without indexes...');
                await models.ReviewImage.sync(noIndexOptions);
            }

            // Create Cart related tables
            if (models.Cart) {
                console.log('Creating Cart table without indexes...');
                await models.Cart.sync(noIndexOptions);
            }

            if (models.CartItem) {
                console.log('Creating CartItem table without indexes...');
                await models.CartItem.sync(noIndexOptions);
            }

            // Create Wishlist table
            if (models.Wishlist) {
                console.log('Creating Wishlist table without indexes...');
                await models.Wishlist.sync(noIndexOptions);
            }

            // Create Slider table
            if (models.Slider) {
                console.log('Creating Slider table without indexes...');
                await models.Slider.sync(noIndexOptions);
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
            
            // Step 3: Add essential indexes only
            console.log('Step 3: Adding essential indexes...');
            
            // Define essential indexes for each table
            const essentialIndexes = {
                orders: [
                    { column: 'order_number', unique: true },
                    { column: 'status' }
                ],
                users: [
                    { column: 'email', unique: true }
                ],
                product_variations: [
                    { column: 'sku', unique: true }
                ]
            };

            // Add essential indexes
            for (const [table, indexes] of Object.entries(essentialIndexes)) {
                for (const index of indexes) {
                    const uniqueClause = index.unique ? 'UNIQUE' : '';
                    await sequelize.query(`
                        ALTER TABLE ${table}
                        ADD ${uniqueClause} INDEX idx_${table}_${index.column} (${index.column})
                    `).catch(err => {
                        console.log(`Index for ${table}.${index.column} might already exist, continuing...`);
                    });
                }
            }

            // Add parentId index to categories separately
            await sequelize.query(`
                ALTER TABLE categories
                ADD INDEX idx_categories_parentId (parentId)
            `).catch(err => {
                console.log('ParentId index might already exist, continuing...');
            });

            console.log('Database setup completed successfully!');
            return true;
        } catch (error) {
            console.error('Error in table creation process:', error);
            throw error;
        }
    } catch (error) {
        console.error('Database setup failed:', error);
        throw error;
    }
}; 