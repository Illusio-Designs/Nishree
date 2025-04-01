import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const ProductBadgeMapping = sequelize.define('ProductBadgeMapping', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    badgeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'product_badges',
            key: 'id'
        }
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'product_badge_mappings',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['productId', 'badgeId']
        }
    ]
}); 