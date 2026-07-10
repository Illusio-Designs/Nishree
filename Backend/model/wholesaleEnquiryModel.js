import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// WholesaleEnquiry — a bulk/B2B pricing request submitted from the public
// wholesale page and reviewed by the sales team in the dashboard.
export const WholesaleEnquiry = sequelize.define('WholesaleEnquiry', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    business_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contact_person: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
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
    gst_number: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    product_interest: {
        type: DataTypes.STRING,
        allowNull: true
    },
    quantity_estimate: {
        type: DataTypes.STRING,
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('new', 'contacted', 'converted', 'closed'),
        defaultValue: 'new'
    }
}, {
    tableName: 'wholesale_enquiries',
    timestamps: true,
    underscored: true
});

export default WholesaleEnquiry;
