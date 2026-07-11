import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// State/Province reference data (dropdown source), scoped to a country.
export const State = sequelize.define('State', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING(10), allowNull: true },
    country_id: { type: DataTypes.INTEGER, allowNull: true }
}, {
    tableName: 'states',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['country_id'] }]
});

export default State;
