const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductVariationAttribute = sequelize.define('ProductVariationAttribute', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    variationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'product_variations',
            key: 'id'
        }
    },
    attributeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'attributes',
            key: 'id'
        }
    },
    valueId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'attribute_values',
            key: 'id'
        }
    }
}, {
    tableName: 'product_variation_attributes',
    timestamps: true
});

module.exports = ProductVariationAttribute; 