const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'draft'),
        defaultValue: 'draft'
    },
    // Review-related fields
    avg_rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
        defaultValue: null
    },
    review_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    has_video_reviews: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    featured_review_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'reviews',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        constraints: false
    }
}, {
    tableName: 'products',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    indexes: [
        {
            unique: true,
            fields: ['slug']
        },
        {
            fields: ['status']
        },
        {
            fields: ['avg_rating']
        },
        {
            fields: ['review_count']
        }
    ]
});

module.exports = Product; 