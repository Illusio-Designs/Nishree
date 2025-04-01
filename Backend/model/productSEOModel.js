import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; // Ensure to use .js extension

export const ProductSEO = sequelize.define('ProductSEO', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    meta_title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    meta_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    meta_keywords: {
        type: DataTypes.STRING,
        allowNull: true
    },
    og_title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    og_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    og_image: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'product_seo',
    timestamps: true,
    underscored: true, // Use underscored naming convention
    indexes: [
      {
        unique: true,
        fields: ['product_id']
      }
    ]
});

export default ProductSEO; // Use export default 