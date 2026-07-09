import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// SalesmanState — join between a salesman and a state (by name) mapping the
// territory the rep serves.
export const SalesmanState = sequelize.define('SalesmanState', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    salesman_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'salesman_states',
    timestamps: true,
    underscored: true
});

export default SalesmanState;
