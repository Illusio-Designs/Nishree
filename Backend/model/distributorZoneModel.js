import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// DistributorZone — join between a distributor and a zone that maps its territory.
export const DistributorZone = sequelize.define('DistributorZone', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    zone_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'distributor_zones',
    timestamps: true,
    underscored: true
});

export default DistributorZone;
