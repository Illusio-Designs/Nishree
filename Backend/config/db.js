import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

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

// Test database connection
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

// Function to sync models with controlled order and proper error handling
const syncModels = async () => {
    try {
        // Import all models once they're defined
        const { 
            User, Category, Attribute, Product, Slider, Coupon, 
            ShippingFee, AttributeValue, ProductVariation, ProductImage, 
            ProductSEO, ProductBadge, ShippingAddress, 
            ProductBadgeMapping, ProductDiscount, Wishlist, Order, OrderItem,
            OrderStatusHistory, Payment, Review, ReviewImage, 
            ReviewLike, ReviewComment, ReviewReport, ProductVariationAttribute
        } = require('../model/associations');
        
        // Log all models that will be synchronized
        console.log('Attempting to synchronize all models in sequence...');
        
        // Phase 1: Sync independent base tables first
        console.log('\n--- Phase 1: Synchronizing independent models ---');
        const independentModels = [
            { name: 'User', model: User },
            { name: 'Category', model: Category },
            { name: 'Attribute', model: Attribute },
            { name: 'Slider', model: Slider },
            { name: 'ProductBadge', model: ProductBadge },
            { name: 'Coupon', model: Coupon },
            { name: 'ShippingFee', model: ShippingFee }
        ];
        
        for (const { name, model } of independentModels) {
            try {
                await model.sync({ alter: false });
                console.log(`✓ Synchronized ${name}`);
            } catch (error) {
                console.error(`✗ Error syncing ${name}:`, error.message);
            }
        }
        
        // Phase 2: Sync Product table next
        console.log('\n--- Phase 2: Synchronizing Product model ---');
        try {
            await Product.sync({ alter: false });
            console.log('✓ Synchronized Product');
        } catch (error) {
            console.error('✗ Error syncing Product:', error.message);
        }
        
        // Phase 3: Sync models that depend directly on Product
        console.log('\n--- Phase 3: Synchronizing first-level dependent models ---');
        const firstLevelDependents = [
            { name: 'AttributeValue', model: AttributeValue },
            { name: 'ProductVariation', model: ProductVariation },
            { name: 'ProductImage', model: ProductImage },
            { name: 'ProductSEO', model: ProductSEO },
            { name: 'ProductDiscount', model: ProductDiscount },
            { name: 'ShippingAddress', model: ShippingAddress }
        ];
        
        for (const { name, model } of firstLevelDependents) {
            try {
                await model.sync({ alter: false });
                console.log(`✓ Synchronized ${name}`);
            } catch (error) {
                console.error(`✗ Error syncing ${name}:`, error.message);
            }
        }
        
        // Phase 4: Sync junction/mapping tables
        console.log('\n--- Phase 4: Synchronizing junction/mapping tables ---');
        const junctionModels = [
            { name: 'ProductBadgeMapping', model: ProductBadgeMapping },
            { name: 'Wishlist', model: Wishlist },
            { name: 'ProductVariationAttribute', model: ProductVariationAttribute },
        ];
        
        for (const { name, model } of junctionModels) {
            try {
                await model.sync({ alter: false });
                console.log(`✓ Synchronized ${name}`);
            } catch (error) {
                console.error(`✗ Error syncing ${name}:`, error.message);
            }
        }
        
        // Phase 5: Sync order management tables
        console.log('\n--- Phase 5: Synchronizing order management models ---');
        const orderModels = [
            { name: 'Order', model: Order },
            { name: 'OrderItem', model: OrderItem },
            { name: 'OrderStatusHistory', model: OrderStatusHistory },
            { name: 'Payment', model: Payment }
        ];
        
        for (const { name, model } of orderModels) {
            try {
                await model.sync({ alter: false });
                console.log(`✓ Synchronized ${name}`);
            } catch (error) {
                console.error(`✗ Error syncing ${name}:`, error.message);
            }
        }
        
        // Phase 6: Sync review system tables
        console.log('\n--- Phase 6: Synchronizing review system models ---');
        const reviewModels = [
            { name: 'Review', model: Review },
            { name: 'ReviewImage', model: ReviewImage },
            { name: 'ReviewLike', model: ReviewLike },
            { name: 'ReviewComment', model: ReviewComment },
            { name: 'ReviewReport', model: ReviewReport }
        ];
        
        for (const { name, model } of reviewModels) {
            try {
                await model.sync({ alter: false });
                console.log(`✓ Synchronized ${name}`);
            } catch (error) {
                console.error(`✗ Error syncing ${name}:`, error.message);
            }
        }
        
        // Final check to see if we synced all tables
        console.log('\nDatabase synchronization process completed.');
        
        // Check for any key models that failed to sync
        const allModels = [
            ...independentModels, 
            { name: 'Product', model: Product },
            ...firstLevelDependents,
            ...junctionModels,
            ...orderModels,
            ...reviewModels
        ];
        
        const failedModels = allModels.filter(({ name, model }) => {
            try {
                return !model.tableAttributes;
            } catch {
                return true;
            }
        }).map(({ name }) => name);
        
        if (failedModels.length > 0) {
            console.warn(`\nWarning: The following models could not be synchronized properly: ${failedModels.join(', ')}`);
            console.warn('Please check their associations and foreign key references.');
            return false;
        }
        
        console.log('\n✓ All models synchronized successfully!');
        return true;
    } catch (error) {
        console.error('Database general sync error:', error.message);
        return false;
    }
};

export { sequelize, testConnection, syncModels };