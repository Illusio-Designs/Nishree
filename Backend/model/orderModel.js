const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    shipping_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    final_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    payment_type: {
        type: DataTypes.ENUM('cod', 'credit_card', 'debit_card', 'upi', 'wallet'),
        allowNull: false
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    tracking_number: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    courier_service: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'orders',
    timestamps: true, // This will add createdAt and updatedAt fields
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    indexes: [
        {
            unique: true,
            fields: ['order_number']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['payment_status']
        }
    ]
});

module.exports = Order; 