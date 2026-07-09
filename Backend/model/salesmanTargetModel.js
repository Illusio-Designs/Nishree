import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// SalesmanTarget — a sales target assigned to a salesman for a period. Achievement
// is computed against orders in the B2B analytics report.
export const SalesmanTarget = sequelize.define('SalesmanTarget', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    salesman_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    target_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    // Optional scoping of which order type counts toward the target.
    order_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'salesman_targets',
    timestamps: true,
    underscored: true
});

export default SalesmanTarget;
