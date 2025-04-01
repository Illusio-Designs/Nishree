import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; // Ensure to use .js extension

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'categories',
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
    metaTags: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'categories',
    timestamps: true,
    indexes: [
        {
            fields: ['parentId']
        },
        {
            fields: ['status']
        }
    ],
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
});

// Note: Self-referential relationships are defined in associations.js

export default Category;