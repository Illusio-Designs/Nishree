import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; // Ensure to use .js extension

export const ProductBadge = sequelize.define('ProductBadge', {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('manual', 'auto'),
        defaultValue: 'manual'
    },
    autoType: {
        type: DataTypes.ENUM('new', 'best_seller', 'featured', 'sale', 'out_of_stock'),
        allowNull: true
    },
    conditions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON conditions for automatic badge assignment'
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'product_badges',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['name']
        }
    ]
});

export default ProductBadge; // Use export default 