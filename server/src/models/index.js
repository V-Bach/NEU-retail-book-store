const User = require('./User');
const Book = require('./Book');
const Category = require('./Category');
const Author = require('./Author');

Category.hasMany(Book, {
    foreignKey: 'category_id',
    as: 'books'
});
Book.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
});

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

module.exports = {
    User,
    Book,
    Category,
    Author,
};