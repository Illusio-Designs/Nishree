const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    parentId: {
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
    seoTitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    seoDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    seoKeywords: {
        type: DataTypes.STRING,
        allowNull: true
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    metaTags: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'categories'
});

// Self-referential relationship for parent-child categories
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

module.exports = Category;