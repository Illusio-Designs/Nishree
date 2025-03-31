const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProductBadgeMapping = sequelize.define('ProductBadgeMapping', {
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
    }
}, {
    tableName: 'product_badge_mappings',
    timestamps: true
});

module.exports = ProductBadgeMapping; 