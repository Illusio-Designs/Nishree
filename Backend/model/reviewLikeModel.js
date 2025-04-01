import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; // Ensure to use .js extension

const ReviewLike = sequelize.define('ReviewLike', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    review_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'reviews',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'review_likes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    indexes: [
        {
            unique: true,
            fields: ['review_id', 'user_id']
        }
    ]
});

export default ReviewLike; // Use export default 