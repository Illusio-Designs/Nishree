const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductBadge = sequelize.define('ProductBadge', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    badgeType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    colorCode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    iconName: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'product_badges',
    timestamps: true
});

module.exports = ProductBadge; 