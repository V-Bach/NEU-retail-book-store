// server/src/models/index.js 

const { sequelize } = require('../config/db.config'); // GIỮ LẠI ĐỂ THIẾT LẬP QUAN HỆ

const User = require('./User');
const Book = require('./Book');
const Category = require('./Category');
const Author = require('./Author');
const Review = require('./Review');
const Loan = require('./Loan');

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

User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });




// --- QUAN HỆ MƯỢN SÁCH (Loan) ---
// User <-> Loan (1:N)
User.hasMany(Loan, { foreignKey: 'user_id', as: 'loans' });
Loan.belongsTo(User, { foreignKey: 'user_id', as: 'borrower' });

// Book <-> Loan (1:N)
Book.hasMany(Loan, { foreignKey: 'book_id', as: 'loan_records' });
Loan.belongsTo(Book, { foreignKey: 'book_id', as: 'borrowed_book' });

// EXPORT CÁC MODELS 
module.exports = {
    User,
    Book,
    Category,
    Author,
    Review,
    Loan,
};