const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },
    email: {
        type: DataTypes.STRING,
        allowNULL: false,
        unique: true 
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    first_name: {
        type: DataTypes.STRING(100) 
    },
    last_name: {
        type: DataTypes.STRING(100)
    },
    role: {
        type: DataTypes.ENUM('customer', 'admin'),
        allowNull: false,
        defaultValue: 'customer'
    } 
}, {
    tableName: 'Users',
    timestamps: true
});

module.exports = User;