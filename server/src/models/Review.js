//server/src/models/Review.js

// server/src/models/Review.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config'); 

const Review = sequelize.define('Review', {
    review_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // liên kết Review với sách trên Google Books
    google_book_id: { 
        type: DataTypes.STRING,
        allowNull: false,
        unique: false // Nhiều review cho cùng một sách
    },
    user_id: { 
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rating: {
        type: DataTypes.FLOAT, // Ví dụ: 4.5/5.0
        allowNull: true,
        validate: { min: 0, max: 5 }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'Reviews',
    timestamps: true 
});

module.exports = Review;