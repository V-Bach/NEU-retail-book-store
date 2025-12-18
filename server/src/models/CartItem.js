const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const CartItem = sequelize.define('CartItem', {
    cart_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    book_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    is_borrowing: { type: DataTypes.BOOLEAN, defaultValue: false } // true: mượn, false: mua
}, { tableName: 'CartItems' });

module.exports = CartItem;