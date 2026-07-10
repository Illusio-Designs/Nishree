import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// Blog / Recipe post shown on the public site and managed from the dashboard.
export const Blog = sequelize.define('Blog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // 'recipe' posts render as recipes; 'article' as general blog content.
    type: {
        type: DataTypes.ENUM('recipe', 'article'),
        defaultValue: 'recipe'
    },
    excerpt: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    author: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    read_time: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'published'),
        defaultValue: 'draft'
    },
    published_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'blogs',
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ['slug'] }]
});

export default Blog;
