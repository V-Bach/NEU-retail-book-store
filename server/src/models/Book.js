const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Book = sequelize.define('Book', {
    book_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    publication_date: {
        type: DataTypes.DATEONLY // Chỉ lưu ngày tháng
    },
    publisher: {
        type: DataTypes.STRING(150)
    },
    cover_image_url: {
        type: DataTypes.STRING(255)
    },
}, {
    tableName: 'Books',
    timestamps: true
});

module.exports = Book;