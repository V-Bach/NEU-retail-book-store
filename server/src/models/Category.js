const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Category = sequelize.define('Category', {
    category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
    }
}, {
    tableName: 'Categories',
    timestamps: false
});

module.exports = Category;