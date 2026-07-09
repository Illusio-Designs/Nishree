import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// Zone — geographic grouping used for B2B territory mapping
// (distributors and salesmen are mapped to zones + states).
export const Zone = sequelize.define('Zone', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'zones',
    timestamps: true
});

export default Zone;
