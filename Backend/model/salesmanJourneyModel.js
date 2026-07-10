import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// SalesmanJourney — a salesman's day journey (beat/route). The header row for a
// single day: when the day started/ended, from/to coordinates, and the total
// distance travelled (accumulated from the breadcrumb points). This is an
// add-on to the visit/geofence system: check-ins prove presence at a party,
// while the journey traces the whole day's movement.
export const SalesmanJourney = sequelize.define('SalesmanJourney', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    salesman_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    journey_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'completed'),
        defaultValue: 'active'
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    start_latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },
    start_longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },
    end_latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },
    end_longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },
    // Total route distance (metres), accumulated across breadcrumb points.
    total_distance_m: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },
    // Optional odometer readings for travel/reimbursement claims.
    start_odometer: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    end_odometer: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'salesman_journeys',
    timestamps: true,
    underscored: true
});

export default SalesmanJourney;
