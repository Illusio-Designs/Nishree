import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// Salesman — a field sales rep mapped to states + zones (territory in the
// SalesmanState / SalesmanZone join tables). KYC documents are stored as
// uploaded file paths.
export const Salesman = sequelize.define('Salesman', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Optional linked login account (role: 'salesman'). Active status mirrors onto
    // this account to block access when a salesman leaves.
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
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
    country: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'India'
    },
    pincode: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    // KYC / onboarding documents (image or PDF file paths under uploads/salesmen).
    pan_card: {
        type: DataTypes.STRING,
        allowNull: true
    },
    aadhaar_card: {
        type: DataTypes.STRING,
        allowNull: true
    },
    cancelled_cheque: {
        type: DataTypes.STRING,
        allowNull: true
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'salesmen',
    timestamps: true,
    underscored: true
});

export default Salesman;
