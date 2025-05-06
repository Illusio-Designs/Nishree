import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const tablesToKeep = [
  'users',
  'categories',
  'products',
  'product_variations',
  'orders',
  'order_items',
  'sliders',
  'seo',
  'settings',
  'migrations',
  'migration_versions'
];

async function cleanupDatabase() {
  try {
    // Get all tables in the database
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const allTables = result.rows.map(row => row.table_name);
    const tablesToRemove = allTables.filter(table => !tablesToKeep.includes(table));

    console.log('Tables to remove:', tablesToRemove);

    // Drop each unwanted table
    for (const table of tablesToRemove) {
      try {
        await pool.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
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

// Run the cleanup
cleanupDatabase(); 