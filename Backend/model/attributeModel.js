const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attribute = sequelize.define('Attribute', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'attributes',
    timestamps: true
});

module.exports = Attribute; 