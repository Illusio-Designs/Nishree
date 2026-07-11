import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// Party — a B2B retail customer (shop). Records capture the shop, contact and a
// required address so the location can be geocoded for visit verification.
export const Party = sequelize.define('Party', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Optional linked login account (role: 'party'). Kept nullable so a party can
    // exist as a managed record before a portal login is provisioned.
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Owning distributor (a party may be routed through a distributor).
    distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    zone_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // The salesman who registered this shop from the field (null for office-added).
    added_by_salesman_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    shop_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    trade_name: {
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
    // Required address so the shop can be geocoded (see utils/geocode.js).
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
    // Geocoded coordinates (resolved from the address via Nominatim).
    latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },
    longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },
    // Credit terms for wholesale billing.
    credit_limit: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },
    credit_days: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'parties',
    timestamps: true,
    underscored: true
});

export default Party;
