const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Slider = sequelize.define('Slider', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tagline: {
        type: DataTypes.STRING,
        allowNull: true
    },
    buttonText: {
        type: DataTypes.STRING,
        allowNull: true
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Categories',
            key: 'id'
        }
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'sliders',
    timestamps: true
});

module.exports = Slider;

