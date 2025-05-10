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
            model: 'coupons',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    appliedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'coupon_usages',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['couponId', 'orderId']
        }
    ]
}); 