import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// AuditLog — change history for key tables. Create/update/delete operations are
// recorded with old/new value snapshots for traceability.
export const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Actor (nullable for system actions).
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    entity: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entity_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    action: {
        type: DataTypes.ENUM('create', 'update', 'delete'),
        allowNull: false
    },
    old_values: {
        type: DataTypes.JSON,
        allowNull: true
    },
    new_values: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'audit_logs',
    timestamps: true,
    underscored: true
});

export default AuditLog;
