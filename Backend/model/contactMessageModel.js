import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// ContactMessage — a message submitted from the public "Contact us" form and
// triaged by the team in the dashboard.
export const ContactMessage = sequelize.define('ContactMessage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('new', 'read', 'replied', 'closed'),
        defaultValue: 'new'
    }
}, {
    tableName: 'contact_messages',
    timestamps: true,
    underscored: true
});

export default ContactMessage;
