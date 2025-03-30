const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    payment_type: {
        type: DataTypes.ENUM('cod', 'credit_card', 'debit_card', 'upi', 'wallet'),
        allowNull: false
    },
    transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    amount_paid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'successful', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
    },
    payment_gateway: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'payments',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    indexes: [
        {
            fields: ['order_id']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['transaction_id']
        },
        {
            fields: ['status']
        }
    ]
});

module.exports = Payment; 