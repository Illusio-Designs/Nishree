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

            // Create Coupon table without indexes
            if (models.Coupon) {
                console.log('Creating Coupon table without indexes...');
                await models.Coupon.sync({
                    hooks: false,
                    alter: true,
                    indexes: false
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

            // Helper function to execute query with database selection
            const executeQuery = async (query) => {
                const dbName = process.env.DB_NAME || process.env.DB_DATABASE;
                // First select the database
                await sequelize.query(`USE ${dbName}`);
                // Then execute the actual query
                return await sequelize.query(query);
            };

            // Create ProductVariation table
            if (models.ProductVariation) {
                console.log('Creating ProductVariation table without indexes...');
                try {
                    // Create table without any indexes or constraints
                    await executeQuery(`
                        CREATE TABLE IF NOT EXISTS product_variations (
                            id INT NOT NULL AUTO_INCREMENT,
                            productId INT NOT NULL,
                            sku VARCHAR(255) NOT NULL,
                            price DECIMAL(10,2) NOT NULL,
                            comparePrice DECIMAL(10,2) NULL,
                            stock INT NOT NULL DEFAULT 0,
                            attributes JSON NOT NULL DEFAULT ('{}'),
                            createdAt DATETIME NOT NULL,
                            updatedAt DATETIME NOT NULL,
                            PRIMARY KEY (id)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
                    `);

                    // Add foreign key constraint
                    await executeQuery(`
                        ALTER TABLE product_variations
                        ADD CONSTRAINT fk_product_variations_product
                        FOREIGN KEY (productId) REFERENCES products(id)
                        ON DELETE CASCADE
                    `).catch(err => {
                        console.log('Foreign key constraint might already exist, continuing...');
                    });

                } catch (error) {
                    console.error('Error creating ProductVariation table:', error);
                    console.log('Continuing with other tables...');
                }
            }

            // Create Order table
            if (models.Order) {
                console.log('Creating Order table without indexes...');
                try {
                    // Create table without any indexes or constraints
                    await executeQuery(`
                        CREATE TABLE IF NOT EXISTS orders (
                            id INT NOT NULL AUTO_INCREMENT,
                            userId INT NOT NULL,
                            order_number VARCHAR(255) NOT NULL,
                            status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
                            total_amount DECIMAL(10,2) NOT NULL,
                            shipping_address_id INT,
                            payment_id INT,
                            createdAt DATETIME NOT NULL,
                            updatedAt DATETIME NOT NULL,
                            PRIMARY KEY (id)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
                    `);

                    // Add foreign key constraints
                    await executeQuery(`
                        ALTER TABLE orders
                        ADD CONSTRAINT fk_orders_user
                        FOREIGN KEY (userId) REFERENCES users(id)
                        ON DELETE CASCADE,
                        ADD CONSTRAINT fk_orders_shipping_address
                        FOREIGN KEY (shipping_address_id) REFERENCES shipping_addresses(id)
                        ON DELETE SET NULL,
                        ADD CONSTRAINT fk_orders_payment
                        FOREIGN KEY (payment_id) REFERENCES payments(id)
                        ON DELETE SET NULL
                    `).catch(err => {
                        console.log('Foreign key constraints might already exist, continuing...');
                    });

                } catch (error) {
                    console.error('Error creating Order table:', error);
                    console.log('Continuing with other tables...');
                }
            }

            // Create other tables without indexes
            const otherTables = [
                'ProductImage', 'ProductSEO', 'OrderItem', 'OrderStatusHistory',
                'Payment', 'ShippingAddress', 'Review', 'ReviewImage',
                'Cart', 'CartItem', 'Wishlist', 'Slider'
            ];

            for (const tableName of otherTables) {
                if (models[tableName]) {
                    console.log(`Creating ${tableName} table without indexes...`);
                    try {
                        await models[tableName].sync({
                            hooks: false,
                            alter: true,
                            indexes: false
                        });
                    } catch (error) {
                        console.error(`Error creating ${tableName} table:`, error);
                        console.log('Continuing with other tables...');
                    }
                }
            }
            
            // Step 2: Apply associations
            console.log('Step 2: Applying associations...');
            await import(`file://${path.join(__dirname, '..', 'model', 'associations.js')}`);
            
            // Step 3: Add essential indexes only
            console.log('Step 3: Adding essential indexes...');
            
            // Add essential indexes for users
            await executeQuery(`
                ALTER TABLE users
                ADD UNIQUE INDEX idx_users_email (email)
            `).catch(err => {
                console.log('Index for users.email might already exist, continuing...');
            });

            // Add parentId index to categories
            await executeQuery(`
                ALTER TABLE categories
                ADD INDEX idx_categories_parentId (parentId)
            `).catch(err => {
                console.log('Index for categories.parentId might already exist, continuing...');
            });

            // Add essential indexes for orders
            await executeQuery(`
                ALTER TABLE orders
                ADD UNIQUE INDEX idx_orders_order_number (order_number)
            `).catch(err => {
                console.log('Index for orders.order_number might already exist, continuing...');
            });

            await executeQuery(`
                ALTER TABLE orders
                ADD INDEX idx_orders_status (status)
            `).catch(err => {
                console.log('Index for orders.status might already exist, continuing...');
            });

            // Add essential indexes for product_variations
            await executeQuery(`
                ALTER TABLE product_variations
                ADD UNIQUE INDEX idx_product_variations_sku (sku)
                    `).catch(err => {
                console.log('Index for product_variations.sku might already exist, continuing...');
            });

            // Add essential index for coupons
            await executeQuery(`
                ALTER TABLE coupons
                ADD UNIQUE INDEX idx_coupons_code (code)
            `).catch(err => {
                console.log('Index for coupons.code might already exist, continuing...');
            });

            await executeQuery(`
                ALTER TABLE product_variations
                ADD INDEX idx_product_variations_productId (productId)
            `).catch(err => {
                console.log('Index for product_variations.productId might already exist, continuing...');
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

// Add port handling function
export const findAvailablePort = async (startPort) => {
    const net = await import('net');
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(findAvailablePort(startPort + 1));
            } else {
                reject(err);
            }
        });
        server.listen(startPort, () => {
            server.close(() => {
                resolve(startPort);
            });
        });
    });
}; 