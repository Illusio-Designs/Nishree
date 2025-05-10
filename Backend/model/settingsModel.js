import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import crypto from 'crypto';

const Settings = sequelize.define('Settings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('value');
            if (this.getDataValue('is_encrypted')) {
                try {
                    const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
                    let decrypted = decipher.update(rawValue, 'hex', 'utf8');
                    decrypted += decipher.final('utf8');
                    return decrypted;
                } catch (error) {
                    console.error('Decryption error:', error);
                    return null;
                }
            }
            return rawValue;
        },
        set(value) {
            if (this.getDataValue('is_encrypted')) {
                try {
                    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
                    let encrypted = cipher.update(value, 'utf8', 'hex');
                    encrypted += cipher.final('hex');
                    this.setDataValue('value', encrypted);
                } catch (error) {
                    console.error('Encryption error:', error);
                    this.setDataValue('value', null);
                }
            } else {
                this.setDataValue('value', value);
            }
        }
    },
    is_encrypted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'settings',
    underscored: true,
    timestamps: true,
    indexes: []
});

export { Settings };
export default Settings; 