import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// Offer — a B2B discount that can be applied to a wholesale order. When applied,
// the offer is snapshotted onto the order (Order.applied_offer) so later edits to
// the offer do not rewrite order history.
export const Offer = sequelize.define('Offer', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false
    },
    value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    min_order_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },
    max_discount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },
    // Optional scoping of who/what the offer applies to.
    applicable_order_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'expired'),
        defaultValue: 'active'
    }
}, {
    tableName: 'offers',
    timestamps: true,
    underscored: true
});

export default Offer;
