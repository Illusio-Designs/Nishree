import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; // Ensure to use .js extension

export const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null for guest orders
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    is_guest: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    guest_email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    guest_phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    guest_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    order_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    shipping_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    final_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    payment_type: {
        // 'credit' supports wholesale orders billed against a party/distributor's
        // credit terms rather than paid up front.
        type: DataTypes.ENUM('cod', 'credit_card', 'debit_card', 'upi', 'wallet', 'credit'),
        allowNull: false
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // ---- B2B / D2C unification ----
    // Every order lives in this one table. `channel` splits retail (d2c) from
    // wholesale (b2b); `order_type` refines the B2B origin. Existing D2C orders
    // default to channel='d2c', order_type='d2c_order'.
    channel: {
        type: DataTypes.ENUM('d2c', 'b2b'),
        defaultValue: 'd2c',
        allowNull: false
    },
    order_type: {
        type: DataTypes.ENUM(
            'd2c_order',
            'party_order',
            'distributor_order',
            'event_order',
            'visit_order',
            'whatsapp_order'
        ),
        defaultValue: 'd2c_order',
        allowNull: false
    },
    // B2B counterparties (nullable for D2C orders).
    party_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    salesman_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    event_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Wholesale pricing breakdown + applied-offer snapshot.
    subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },
    discount_total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    applied_offer: {
        type: DataTypes.JSON,
        allowNull: true
    },
    // Location capture for visit orders (verified against the party address).
    checkin_latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },
    checkin_longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },
    location_distance_m: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    tableName: 'orders',
    timestamps: true, // This will add createdAt and updatedAt fields
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    underscored: true,
    indexes: [] // Remove all indexes initially
});

// Add indexes after model definition
Order.addHook('afterSync', async () => {
    try {
        // Add unique constraint on order_number
        await sequelize.query('ALTER TABLE orders ADD UNIQUE INDEX idx_order_number (order_number)');
        // Add index on user_id
        await sequelize.query('ALTER TABLE orders ADD INDEX idx_user_id (user_id)');
        // Add index on status
        await sequelize.query('ALTER TABLE orders ADD INDEX idx_status (status)');
        // Add index on payment_status
        await sequelize.query('ALTER TABLE orders ADD INDEX idx_payment_status (payment_status)');
    } catch (error) {
        console.error('Error adding indexes:', error);
    }
});

export default Order; 