import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Policy = sequelize.define(
	'Policy',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false
		}
	},
	{
		timestamps: true,
		tableName: 'policies'
	}
);


