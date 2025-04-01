import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; // Ensure to use .js extension

const ProductImage = sequelize.define('ProductImage', {
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
    variationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'product_variations',
            key: 'id'
        }
    },
    imageName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    altText: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'product_images',
    timestamps: true
});

export default ProductImage; // Use export default 