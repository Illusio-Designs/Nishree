import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Shipment = sequelize.define('Shipment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    shiprocket_order_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Order ID from Shiprocket'
    },
    shipment_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Shipment ID from Shiprocket'
    },
    awb_code: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Air Waybill Code'
    },
    courier_name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Courier partner name'
    },
    courier_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Courier ID from Shiprocket'
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        comment: 'Shipment status: pending, created, shipped, in_transit, delivered, cancelled'
    },
    tracking_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Tracking URL for the shipment'
    },
    estimated_delivery_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    shipped_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    delivered_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'shipments',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['order_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['shiprocket_order_id']
        }
    ]
});
