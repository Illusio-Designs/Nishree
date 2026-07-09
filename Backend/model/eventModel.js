import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// Event — an exhibition/roadshow that groups event-based B2B orders.
export const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('upcoming', 'ongoing', 'past'),
        defaultValue: 'upcoming'
    }
}, {
    tableName: 'events',
    timestamps: true,
    underscored: true
});

export default Event;
