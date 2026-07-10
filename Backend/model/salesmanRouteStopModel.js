import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// SalesmanRouteStop — one party on a salesman's daily beat/route. The route is
// auto-generated from the parties in the salesman's zone(s) for a given date;
// each stop tracks a working state (pending → visited / skipped). A stop turns
// "visited" automatically when the salesman checks in or places a visit order
// at that party on that date.
export const SalesmanRouteStop = sequelize.define('SalesmanRouteStop', {
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
        allowNull: false
    },
    route_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    sequence: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'visited', 'skipped'),
        defaultValue: 'pending'
    },
    skip_reason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    visited_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'salesman_route_stops',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['salesman_id', 'route_date'] },
        { unique: true, fields: ['salesman_id', 'party_id', 'route_date'] }
    ]
});

export default SalesmanRouteStop;
