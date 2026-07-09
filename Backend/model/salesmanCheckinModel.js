import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// SalesmanCheckin — a field visit recorded by a salesman at a party. The device
// GPS is captured and the Haversine distance to the party is stored so presence
// can be verified (see utils/geo.js). Stand-alone visits live here; on-site
// visit orders live in the orders table and are merged into the visit report.
export const SalesmanCheckin = sequelize.define('SalesmanCheckin', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    salesman_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    party_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Recorded device GPS at check-in time.
    latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },
    longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },
    // Haversine distance (metres) between the check-in and the party address.
    distance_m: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'salesman_checkins',
    timestamps: true,
    underscored: true
});

export default SalesmanCheckin;
