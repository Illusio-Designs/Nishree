import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'abandoned', 'converted'),
        defaultValue: 'active'
    }
}, {
    tableName: 'carts',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id']
        }
    ]
}); 