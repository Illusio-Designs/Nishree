import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; // Ensure to use .js extension

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
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['name']
        }
    ]
});

export default ProductBadge; // Use export default 