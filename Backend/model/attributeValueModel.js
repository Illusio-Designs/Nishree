import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; // Ensure to use .js extension

const AttributeValue = sequelize.define('AttributeValue', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    attributeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'attributes',
            key: 'id'
        }
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'attribute_values',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
});

export default AttributeValue; // Use export default 