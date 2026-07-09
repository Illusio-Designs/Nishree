import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// DistributorState — join between a distributor and a state (by name) that maps
// its sales territory.
export const DistributorState = sequelize.define('DistributorState', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'distributor_states',
    timestamps: true,
    underscored: true
});

export default DistributorState;
