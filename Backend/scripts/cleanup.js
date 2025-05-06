import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Tables to keep based on model files
const tablesToKeep = [
  'users',
  'categories',
  'products',
  'product_variations',
  'product_variation_attributes',
  'product_images',
  'product_badges',
  'product_badge_mappings',
  'product_discounts',
  'product_seo',
  'attributes',
  'attribute_values',
  'orders',
  'order_items',
  'order_status_history',
  'payments',
  'carts',
  'cart_items',
  'wishlists',
  'reviews',
  'review_images',
  'shipping_addresses',
  'shipping_fees',
  'settings',
  'sliders',
  'coupons',
  'seo_metadata',
  'migrations',
  'migration_versions'
];

// Scripts to keep
const scriptsToKeep = [
  'setupDatabase.js',
  'createDb.js',
  'cleanup.js'
];

async function checkDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('\nDatabase connection error:', error.message);
    console.log('\nPlease make sure:');
    console.log('1. MySQL is running');
    console.log('2. Database credentials in .env are correct');
    console.log('3. Database exists');
    return false;
  }
}

async function cleanupDatabase() {
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('\nSkipping database cleanup due to connection error');
      return;
    }

    // Get all tables in the database
    const [tables] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [process.env.DB_NAME]);

    const allTables = tables.map(row => row.TABLE_NAME);
    const tablesToRemove = allTables.filter(table => !tablesToKeep.includes(table));

    if (tablesToRemove.length === 0) {
      console.log('\nNo unwanted tables found in the database');
      return;
    }

    console.log('\n=== Database Cleanup ===');
    console.log('Tables to remove:', tablesToRemove);

    // Drop each unwanted table
    for (const table of tablesToRemove) {
      try {
        await pool.query(`DROP TABLE IF EXISTS \`${table}\``);
        console.log(`Successfully removed table: ${table}`);
      } catch (error) {
        console.error(`Error removing table ${table}:`, error.message);
      }
    }

    console.log('Database cleanup completed successfully');
  } catch (error) {
    console.error('Error during database cleanup:', error);
  } finally {
    await pool.end();
  }
}

async function cleanupScripts() {
  try {
    console.log('\n=== Scripts Cleanup ===');
    const files = await fs.readdir(__dirname);
    const scriptsToRemove = files.filter(file => 
      file.endsWith('.js') && !scriptsToKeep.includes(file)
    );

    if (scriptsToRemove.length === 0) {
      console.log('No unwanted scripts found');
      return;
    }

    console.log('Scripts to remove:', scriptsToRemove);

    for (const script of scriptsToRemove) {
      try {
        await fs.unlink(path.join(__dirname, script));
        console.log(`Successfully removed script: ${script}`);
      } catch (error) {
        console.error(`Error removing script ${script}:`, error.message);
      }
    }

    console.log('Scripts cleanup completed successfully');
  } catch (error) {
    console.error('Error during scripts cleanup:', error);
  }
}

async function cleanup() {
  console.log('Starting cleanup process...');
  
  // First cleanup scripts
  await cleanupScripts();
  
  // Then cleanup database
  await cleanupDatabase();
  
  console.log('\nCleanup process completed!');
}

// Run the cleanup
cleanup(); 