import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; // Use named import

export const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true // Nullable for Google login
    },
    role: {
        // 'admin' + 'consumer' are the original D2C roles. The remaining roles are
        // the B2B layer: end-user roles (party / distributor / salesman) are
        // self-scoped, and the *_manager roles scope internal staff to a module.
        type: DataTypes.ENUM(
            'admin',
            'consumer',
            'party',
            'distributor',
            'salesman',
            'sales_manager',
            'distributor_manager',
            'party_manager',
            'product_manager',
            'order_manager',
            'reports_manager',
            'expense_manager'
        ),
        defaultValue: 'consumer',
        allowNull: false
    },
    profileImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    googleId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'users',
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            unique: true,
            fields: ['username']
        }
    ]
});