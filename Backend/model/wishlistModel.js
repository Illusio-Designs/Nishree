import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Product } from './productModel.js';

// Wishlist — a saved product for a logged-in shopper. One row per (user, product).
export const Wishlist = sequelize.define('Wishlist', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'wishlists',
    timestamps: true,
    underscored: true,
    indexes: [
        { unique: true, fields: ['user_id', 'product_id'] }
    ]
});

Wishlist.belongsTo(Product, { foreignKey: 'product_id' });

export default Wishlist;
