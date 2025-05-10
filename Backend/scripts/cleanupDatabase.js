import { sequelize } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of tables to keep (core functionality)
const KEEP_TABLES = [
    'users',
    'categories',
    'products',
    'product_variations',
    'product_images',
    'attributes',
    'attribute_values',
    'orders',
    'order_items',
    'carts',
    'cart_items',
    'wishlists',
    'reviews',
    'review_images',
    'shipping_addresses',
    'shipping_fees',
    'payments',
    'order_status_histories',
    'sliders',
    'seo_metadata',
    'settings'
];

// List of files to keep
const KEEP_FILES = [
    'userModel.js',
    'categoryModel.js',
    'productModel.js',
    'productVariationModel.js',
    'productImageModel.js',
    'attributeModel.js',
    'attributeValueModel.js',
    'orderModel.js',
    'orderItemModel.js',
    'cartModel.js',
    'cartItemModel.js',
    'wishlistModel.js',
    'reviewModel.js',
    'reviewImageModel.js',
    'shippingAddressModel.js',
    'shippingFeeModel.js',
    'paymentModel.js',
    'orderStatusHistoryModel.js',
    'sliderModel.js',
    'seoMetadataModel.js',
    'settingsModel.js',
    'associations.js'
];

async function cleanupDatabase() {
    try {
        console.log('Starting database cleanup...');

        // First, disable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // Get all tables from the database
        const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = '${sequelize.config.database}'
            AND table_type = 'BASE TABLE'
        `);

        console.log('\nFound tables:', tables.map(t => t.table_name).join(', '));

        // Drop unwanted tables
        for (const table of tables) {
            const tableName = table.table_name;
            if (!KEEP_TABLES.includes(tableName)) {
                try {
                    console.log(`\nDropping table: ${tableName}`);
                    await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
                    console.log(`Successfully dropped table: ${tableName}`);
                } catch (tableError) {
                    console.error(`Error dropping table ${tableName}:`, tableError.message);
                }
            } else {
                console.log(`Keeping table: ${tableName}`);
            }
        }

        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('\nDatabase cleanup completed successfully');
    } catch (error) {
        console.error('\nError during database cleanup:', error);
        // Make sure to re-enable foreign key checks even if there's an error
        try {
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        } catch (e) {
            console.error('Error re-enabling foreign key checks:', e);
        }
    }
}

async function cleanupFiles() {
    try {
        console.log('\nStarting file cleanup...');

        const modelDir = path.join(__dirname, '../model');
        const files = fs.readdirSync(modelDir);

        console.log('\nFound files:', files.join(', '));

        // Remove unwanted model files
        for (const file of files) {
            if (!KEEP_FILES.includes(file)) {
                const filePath = path.join(modelDir, file);
                try {
                    console.log(`\nRemoving file: ${file}`);
                    fs.unlinkSync(filePath);
                    console.log(`Successfully removed file: ${file}`);
                } catch (fileError) {
                    console.error(`Error removing file ${file}:`, fileError.message);
                }
            } else {
                console.log(`Keeping file: ${file}`);
            }
        }

        console.log('\nFile cleanup completed successfully');
    } catch (error) {
        console.error('\nError during file cleanup:', error);
    }
}

// Run cleanup
async function cleanup() {
    try {
        console.log('=== Starting Cleanup Process ===\n');
        
        // Verify database connection first
        try {
            await sequelize.authenticate();
            console.log('Database connection verified successfully\n');
        } catch (dbError) {
            console.error('Database connection failed:', dbError.message);
            console.error('\nPlease check your database configuration in .env file');
            process.exit(1);
        }

        await cleanupDatabase();
        await cleanupFiles();
        
        console.log('\n=== Cleanup Process Completed ===');
    } catch (error) {
        console.error('\nError during cleanup:', error);
    } finally {
        process.exit();
    }
}

// Add confirmation prompt
console.log('\nWARNING: This script will remove unwanted tables and files.');
console.log('Make sure you have backed up your data before proceeding.');
console.log('\nPress Ctrl+C to cancel or wait 5 seconds to continue...');

setTimeout(() => {
    cleanup();
}, 5000); 