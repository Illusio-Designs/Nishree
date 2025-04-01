import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    type: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false,
        defaultValue: 'percentage'
    },
    value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    minPurchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    maxDiscount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    usedCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'expired'),
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