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
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    // Guest cart identifier (from the x-guest-id header) when there's no user.
    guest_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'abandoned', 'converted'),
        defaultValue: 'active'
    }
}, {
    tableName: 'carts',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['guest_id'] }
    ]
}); 