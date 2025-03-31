const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: false,
        validate: {
            min: 1.0,
            max: 5.0
        }
    },
    review: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    verified_purchase: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['product_id']
        },
        {
            fields: ['order_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['verified_purchase']
        },
        {
            fields: ['is_featured']
        }
    ]
});

module.exports = Review; 