const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductSEO = sequelize.define('ProductSEO', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    metaTitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    metaDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    metaKeywords: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ogTitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ogDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ogImage: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'product_seo',
    timestamps: true
});

module.exports = ProductSEO; 