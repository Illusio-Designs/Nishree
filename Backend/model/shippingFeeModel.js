const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ShippingFee = sequelize.define('ShippingFee', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_type: {
        type: DataTypes.ENUM('cod', 'prepaid'),
        allowNull: false
    },
    fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    weight_based_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    location_based_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    }
}, {
    tableName: 'shipping_fees',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    indexes: [
        {
            fields: ['order_type']
        }
    ]
});

module.exports = ShippingFee; 