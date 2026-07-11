import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// Country reference data (dropdown source).
export const Country = sequelize.define('Country', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING(3), allowNull: true },
    phone_code: { type: DataTypes.STRING(8), allowNull: true }
}, {
    tableName: 'countries',
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ['name'] }]
});

export default Country;
