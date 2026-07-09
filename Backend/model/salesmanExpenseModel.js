import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// SalesmanExpense — a field expense logged by a salesman and reviewed by managers.
export const SalesmanExpense = sequelize.define('SalesmanExpense', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    salesman_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    expense_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Optional receipt image/PDF path (uploads/expenses).
    receipt: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    }
}, {
    tableName: 'salesman_expenses',
    timestamps: true,
    underscored: true
});

export default SalesmanExpense;
