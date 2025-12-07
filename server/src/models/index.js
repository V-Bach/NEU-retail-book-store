// server/src/models/index.js 

const { sequelize } = require('../config/db.config'); // GIỮ LẠI ĐỂ THIẾT LẬP QUAN HỆ

const User = require('./User');
const Book = require('./Book');
const Category = require('./Category');
const Author = require('./Author');

// THIẾT LẬP QUAN HỆ (ASSOCIATIONS)

// Sách - Thể loại (1:N)
Category.hasMany(Book, { foreignKey: 'category_id', as: 'books' });
Book.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Sách - Tác giả (N:M)
Author.belongsToMany(Book, {
    through: 'Book_Authors', 
    foreignKey: 'author_id',
    as: 'books'
});

Book.belongsToMany(Author, {
    through: 'Book_Authors',
    foreignKey: 'book_id',
    as: 'authors'
});


// 2. EXPORT CÁC MODELS 
module.exports = {
    User,
    Book,
    Category,
    Author,

};