const { sequelize, Sequelize } = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true, // Nullable for Google login
    },
    role: {
        type: Sequelize.ENUM('admin', 'consumer'),
        defaultValue: 'consumer',
        allowNull: false,
    },
    profilePic: {
        type: Sequelize.STRING, // Store file path
        allowNull: true,
    },
    googleId: {
        type: Sequelize.STRING,
        allowNull: true, // Required for Google login
    },
    resetToken: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    resetTokenExpiry: {
        type: Sequelize.DATE,
        allowNull: true,
    }
}, {
    timestamps: true,
});

// Sync table (Uncomment for first-time setup)
// sequelize.sync({ alter: true })
//     .then(() => console.log("User table synced"))
//     .catch(err => console.log("Error syncing table:", err));

module.exports = User;
