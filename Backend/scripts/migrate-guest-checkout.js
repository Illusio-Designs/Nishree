import { sequelize } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
    try {
        console.log('Starting guest checkout migration...');
        
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Make user_id nullable
        await sequelize.query('ALTER TABLE orders MODIFY COLUMN user_id INT NULL');
        console.log('✓ Made user_id nullable');

        // Add guest checkout fields (with IF NOT EXISTS to avoid errors if already exists)
        try {
            await sequelize.query('ALTER TABLE orders ADD COLUMN is_guest BOOLEAN DEFAULT FALSE AFTER user_id');
            console.log('✓ Added is_guest column');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('✓ is_guest column already exists');
            } else throw err;
        }

        try {
            await sequelize.query('ALTER TABLE orders ADD COLUMN guest_email VARCHAR(255) NULL AFTER is_guest');
            console.log('✓ Added guest_email column');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('✓ guest_email column already exists');
            } else throw err;
        }

        try {
            await sequelize.query('ALTER TABLE orders ADD COLUMN guest_phone VARCHAR(20) NULL AFTER guest_email');
            console.log('✓ Added guest_phone column');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('✓ guest_phone column already exists');
            } else throw err;
        }

        try {
            await sequelize.query('ALTER TABLE orders ADD COLUMN guest_name VARCHAR(255) NULL AFTER guest_phone');
            console.log('✓ Added guest_name column');
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log('✓ guest_name column already exists');
            } else throw err;
        }

        // Add index
        try {
            await sequelize.query('ALTER TABLE orders ADD INDEX idx_guest_email (guest_email)');
            console.log('✓ Added index on guest_email');
        } catch (err) {
            if (err.message.includes('Duplicate key')) {
                console.log('✓ Index on guest_email already exists');
            } else throw err;
        }

        // Update order_status_history
        await sequelize.query('ALTER TABLE order_status_history MODIFY COLUMN updated_by INT NULL');
        console.log('✓ Made order_status_history.updated_by nullable');

        // Update payments table
        await sequelize.query('ALTER TABLE payments MODIFY COLUMN user_id INT NULL');
        console.log('✓ Made payments.user_id nullable');

        console.log('\n✅ Guest checkout migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    }
};

runMigration();
