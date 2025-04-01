import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; // Ensure to use .js extension

const ReviewImage = sequelize.define('ReviewImage', {
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
    file_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    file_type: {
        type: DataTypes.ENUM('image', 'video'),
        allowNull: false,
        defaultValue: 'image'
    }
}, {
    tableName: 'review_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    indexes: [
        {
            fields: ['review_id']
        },
        {
            fields: ['file_type']
        }
    ]
});

export default ReviewImage; // Use export default 