import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// One line in a cart. Attributes are camelCase; `underscored: true` maps them to
// snake_case columns (cart_id, product_id, variation_id, selected_size).
export const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'carts', key: 'id' }
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' }
    },
    variationId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    selected_size: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'cart_items',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['cart_id'] },
        { fields: ['product_id'] }
    ]
});

export default CartItem;
