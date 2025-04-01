import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; // Ensure to use .js extension

const ProductBadgeMapping = sequelize.define('ProductBadgeMapping', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    badgeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'product_badges',
            key: 'id'
        }
    }
}, {
    tableName: 'product_badge_mappings',
    timestamps: true
});

export default ProductBadgeMapping; 