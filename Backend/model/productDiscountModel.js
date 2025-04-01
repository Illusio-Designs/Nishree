import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; // Ensure to use .js extension

const ProductDiscount = sequelize.define('ProductDiscount', {
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
    discountType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false
    },
    discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'product_discounts',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
});

export default ProductDiscount; // Use export default 