// server/src/controllers/book.controller.js

const { Book, Category, Author } = require('../models/index');
const { sequelize } = require('../config/db.config'); // Dùng cho transaction
const googleBooksService = require('../services/googleBooks.service');

exports.createBook = async (req, res) => {
    // 1. Tách mảng authors ID và Book Data
    const { authors, ...bookData } = req.body;
    
    if (!bookData.title || !bookData.price || !bookData.category_id) {
        return res.status(400).json({ 
            message: 'Title, price, and category_id are required fields.' 
        });
    }

    const t = await sequelize.transaction(); // Bắt đầu transaction

    try {
        // 3. TẠO SÁCH (Bảng Books)
        const newBook = await Book.create(bookData, { transaction: t });
        
        // 4. XỬ LÝ QUAN HỆ TÁC GIẢ (N:M)
        if (authors && authors.length > 0) {
            // Kiểm tra tất cả các ID tác giả có tồn tại không
            const existingAuthors = await Author.findAll({
                where: { author_id: authors },
                transaction: t
            });

            // Nếu số lượng tác giả hợp lệ không khớp với số lượng ID gửi lên, rollback
            if (existingAuthors.length !== authors.length) {
                await t.rollback();
                return res.status(400).json({ 
                    message: 'One or more author IDs are invalid.' 
                });
            }

            // Thiết lập quan hệ (setAuthors là Sequelize Magic Method)
            await newBook.setAuthors(existingAuthors, { transaction: t });
        }

        await t.commit(); // Cam kết giao dịch

        // 5. Trả về kết quả
        res.status(201).json({
            message: 'Book created successfully',
            book: newBook 
        });
    } catch (error) {
        await t.rollback(); // Hoàn tác nếu có lỗi
        console.error('Error creating book:', error);
        res.status(500).json({ message: 'Server error: could not create book.' });
    }
};

exports.getAllBooks = async (req, res) => {
    try {
        // Sử dụng phương thức findAll() của Sequelize để lấy tất cả bản ghi từ bảng Books
        const books = await Book.findAll({
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name']
                },
                {
                    model: Author,
                    as: 'authors',
                    attributes: ['author_id', 'first_name', 'last_name'],
                    through: { attributes: [] } 
                }
            ],
            order: [['title', 'ASC']]
        });

        if (!books || books.length === 0) {
            return res.status(404).json({ message: 'No books found in the database.' });
        }

        res.status(200).json({ 
            count: books.length,
            books 
        });

    } catch (error) {
        console.error('Error fetching all books:', error);
        res.status(500).json({ message: 'Server error: Could not retrieve books.' });
    }
};

exports.getBookById = async (req, res) => {
    // 1. Lấy ID từ tham số URL
    const { id } = req.params;

    try {
        // 2. Sử dụng findByPk (Find by Primary Key)
        const book = await Book.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name']
                },
                {
                    model: Author,
                    as: 'authors',
                    attributes: ['author_id', 'first_name', 'last_name'],
                    through: { attributes: [] }
                }
            ]
        });

        // 3. Kiểm tra kết quả
        if (!book) {
            return res.status(404).json({ message: `Book with ID ${id} not found.` });
        }

        // 4. Trả về chi tiết sách
        res.status(200).json({ book });

    } catch (error) {
        console.error(`Error fetching book with ID ${id}:`, error);
        res.status(500).json({ message: 'Server error: Could not retrieve book details.' });
    }
};

exports.searchExternalBooks = async (req, res) => {
    const { q } = req.query; // Lấy query từ URL: ?q=Clean%20Code

    if (!q) {
        return res.status(400).json({ message: 'Missing search query parameter (q).' });
    }

    try {
        const results = await googleBooksService.searchBooks(q);
        
        res.status(200).json({
            message: `Found ${results.length} results from external API.`,
            results
        });
    } catch (error) {
        res.status(503).json({ message: 'Error retrieving data from external source. Please check API Key and service status.' });
    }
};

// ========== CÁC FUNCTION MỚI CHO TÌM KIẾM NÂNG CAO ==========

/**
 * Tìm kiếm nâng cao từ Google Books API
 */
exports.advancedExternalSearch = async (req, res) => {
    const {
        title,
        author,
        isbn,
        publisher,
        subject,
        keyword,
        maxResults = 15,
        orderBy = 'relevance',
        printType = 'all',
        lang = 'en'
    } = req.query;

    // Xây dựng params object
    const searchParams = {
        title,
        author,
        isbn,
        publisher,
        subject,
        keyword,
        orderBy,
        printType,
        lang
    };

    // Loại bỏ các trường undefined
    Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === undefined) {
            delete searchParams[key];
        }
    });

    // Nếu không có tham số nào, trả về lỗi
    if (Object.keys(searchParams).length === 0) {
        return res.status(400).json({
            message: 'At least one search parameter is required',
            example: '/api/books/external/advanced?author=Stephen+King&title=The+Shining'
        });
    }

    try {
        const results = await googleBooksService.advancedSearch(searchParams, parseInt(maxResults));
        
        res.status(200).json({
            message: `Found ${results.length} results from external API.`,
            search_params: searchParams,
            results
        });
    } catch (error) {
        res.status(503).json({ 
            message: 'Error retrieving data from external source.',
            error: error.message 
        });
    }
};

/**
 * Tìm kiếm sách theo tác giả từ Google Books API
 */
exports.searchExternalByAuthor = async (req, res) => {
    const { author, maxResults = 15 } = req.query;
    
    if (!author) {
        return res.status(400).json({ 
            message: 'Author name is required. Example: /api/books/external/author?author=J.K.+Rowling' 
        });
    }

    try {
        const results = await googleBooksService.searchByAuthor(author, parseInt(maxResults));
        
        res.status(200).json({
            message: `Found ${results.length} results for author "${author}" from external API.`,
            author,
            results
        });
    } catch (error) {
        res.status(503).json({ 
            message: 'Error retrieving data from external source.',
            error: error.message 
        });
    }
};

/**
 * Tìm kiếm sách theo ISBN từ Google Books API
 */
exports.searchExternalByISBN = async (req, res) => {
    const { isbn } = req.query;
    
    if (!isbn) {
        return res.status(400).json({ 
            message: 'ISBN is required. Example: /api/books/external/isbn?isbn=9780545010221' 
        });
    }

    try {
        const results = await googleBooksService.searchByISBN(isbn);
        
        res.status(200).json({
            message: `Found ${results.length} results for ISBN "${isbn}" from external API.`,
            isbn,
            results
        });
    } catch (error) {
        res.status(503).json({ 
            message: 'Error retrieving data from external source.',
            error: error.message 
        });
    }
};

/**
 * Lấy thông tin sách chi tiết từ Google Books bằng ID
 */
exports.getExternalBookById = async (req, res) => {
    const { googleId } = req.params;
    
    if (!googleId) {
        return res.status(400).json({ 
            message: 'Google Books ID is required. Example: /api/books/external/zyTCAlFPjgYC' 
        });
    }

    try {
        const book = await googleBooksService.getBookByGoogleId(googleId);
        
        if (!book) {
            return res.status(404).json({ 
                message: `Book with Google ID ${googleId} not found.` 
            });
        }
        
        res.status(200).json({
            message: 'Book details retrieved successfully.',
            book
        });
    } catch (error) {
        res.status(503).json({ 
            message: 'Error retrieving book details from external source.',
            error: error.message 
        });
    }
};