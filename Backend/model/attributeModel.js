const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

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
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
});

module.exports = Attribute; 