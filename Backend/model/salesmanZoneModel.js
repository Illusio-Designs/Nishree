import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// SalesmanZone — join between a salesman and a zone mapping the territory served.
export const SalesmanZone = sequelize.define('SalesmanZone', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    salesman_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    zone_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'salesman_zones',
    timestamps: true,
    underscored: true
});

export default SalesmanZone;
