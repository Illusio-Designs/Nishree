import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// SalesmanJourneyPoint — a single GPS breadcrumb in a day journey. Points arrive
// as the device pings location through the day (single or batched for offline
// sync) and together form the salesman's route. `event_type` marks meaningful
// points (day start/end, a check-in, an order) so the route can be annotated.
export const SalesmanJourneyPoint = sequelize.define('SalesmanJourneyPoint', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    journey_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Denormalised for easy per-salesman querying.
    salesman_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false
    },
    longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false
    },
    // GPS accuracy radius (metres), device speed and battery — all optional.
    accuracy_m: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    speed: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    battery: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // When the device captured the point (may differ from server insert time).
    recorded_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Haversine distance from the previous point in the same journey.
    distance_from_prev_m: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    event_type: {
        type: DataTypes.ENUM('start', 'track', 'checkin', 'order', 'end'),
        defaultValue: 'track'
    },
    // Optional link to the related check-in / order id when event_type is set.
    reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'salesman_journey_points',
    timestamps: true,
    underscored: true
});

export default SalesmanJourneyPoint;
