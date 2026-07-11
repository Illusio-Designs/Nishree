import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// City/District reference data (dropdown source), scoped to a state.
export const City = sequelize.define('City', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    state_id: { type: DataTypes.INTEGER, allowNull: true },
    // Denormalised state name so cities can be looked up by state string too.
    state_name: { type: DataTypes.STRING, allowNull: true }
}, {
    tableName: 'cities',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['state_id'] }, { fields: ['state_name'] }]
});

export default City;
