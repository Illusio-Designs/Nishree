const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AttributeValue = sequelize.define('AttributeValue', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    attributeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'attributes',
            key: 'id'
        }
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'attribute_values',
    timestamps: true
});

module.exports = AttributeValue; 