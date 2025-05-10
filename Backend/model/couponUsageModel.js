import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const CouponUsage = sequelize.define('CouponUsage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    couponId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Coupons',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    usedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'coupon_usages',
    timestamps: true
}); 