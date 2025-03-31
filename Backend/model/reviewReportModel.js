const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ReviewReport = sequelize.define('ReviewReport', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    review_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'reviews',
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
    reason: {
        type: DataTypes.ENUM('spam', 'offensive', 'fake', 'other'),
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'resolved', 'rejected'),
        defaultValue: 'pending'
    },
    admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'review_reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    indexes: [
        {
            fields: ['review_id']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['status']
        }
    ]
});

module.exports = ReviewReport; 