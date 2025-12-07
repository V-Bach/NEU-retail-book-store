const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Author = sequelize.define('Author', {
    author_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    last_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    biography: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'Author',
    timestamps: false
});

module.exports = Author;