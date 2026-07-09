import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// Distributor — a wholesale partner mapped to states + zones (territory stored in
// the DistributorState / DistributorZone join tables).
export const Distributor = sequelize.define('Distributor', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Optional linked login account (role: 'distributor').
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    contact_person: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gst_number: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pincode: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    credit_limit: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'distributors',
    timestamps: true,
    underscored: true
});

export default Distributor;
