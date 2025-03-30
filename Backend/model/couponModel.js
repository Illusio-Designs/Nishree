const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed_amount'),
        allowNull: false
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    minimum_order_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    max_uses: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    uses_per_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    valid_from: {
        type: DataTypes.DATE,
        allowNull: false
    },
    valid_to: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'expired'),
        defaultValue: 'active'
    }
}, {
    tableName: 'coupons',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    indexes: [
        {
            unique: true,
            fields: ['code']
        },
        {
            fields: ['status']
        }
    ]
});

module.exports = Coupon; 