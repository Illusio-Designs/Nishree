import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const ProductSEO = sequelize.define('ProductSEO', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Products',
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
    },
    canonicalUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    schemaMarkup: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'product_seo',
    timestamps: true
}); 