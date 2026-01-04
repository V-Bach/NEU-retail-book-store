const { Book, Category, Author } = require('../models/index');
const { sequelize } = require('../config/db.config'); // Dùng cho transaction
const googleBooksService = require('../services/googleBooks.service');

exports.createBook = async (req, res) => {
    const { authors, ...bookData } = req.body;
    
    if (!bookData.title || !bookData.price || !bookData.category_id) {
        return res.status(400).json({ 
            message: 'Title, price, and category_id are required fields.' 
        });
    }

    const t = await sequelize.transaction(); 

    try {
        
        const newBook = await Book.create(bookData, { transaction: t });
        
        
        if (authors && authors.length > 0) {
            const existingAuthors = await Author.findAll({
                where: { author_id: authors },
                transaction: t
            });

            
            if (existingAuthors.length !== authors.length) {
                await t.rollback();
                return res.status(400).json({ 
                    message: 'One or more author IDs are invalid.' 
                });
            }

            await newBook.setAuthors(existingAuthors, { transaction: t });
        }

        await t.commit(); 

        // 5. Trả về kết quả
        res.status(201).json({
            message: 'Book created successfully',
            book: newBook 
        });
    } catch (error) {
        await t.rollback(); 
        console.error('Error creating book:', error);
        res.status(500).json({ message: 'Server error: could not create book.' });
    }
};

exports.getAllBooks = async (req, res) => {
    try {
        
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
    
    const { id } = req.params;

    try {
        
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

       
        if (!book) {
            return res.status(404).json({ message: `Book with ID ${id} not found.` });
        }

        
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

    Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === undefined) {
            delete searchParams[key];
        }
    });

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

exports.updateBook = async (req, res) => {
    const { id } = req.params;
    const { price, stock_quantity, is_available } = req.body;

    const updateFields = {};
    if(price !== undefined) updateFields.price = price;
    if(stock_quantity !== undefined) updateFields.stock_quantity = stock_quantity;
    if(is_available !== undefined) updateFields.is_available = is_available;

    if(Object.keys(updateFields).length === 0) {
        return res.status(400).json({
            message: "No valid fields provided for update(only price, stock_quantity, is_available)"
        });
    }

    try {
        const [updateRowsCount] = await Book.update(updateFields, {
            where: { book_id: id },
        });

        if(updateRowsCount === 0) {
            return res.status(404).json({ message: `Book with id ${id} not found.` });
        }

        const updatedBook = await Book.findByPk(id);

        res.status(200).json({
            message: 'Book inventory and price updated successfully',
            book: updatedBook
        });
    } catch(error) {
        console.error('Error updating book: ', error);
        res.status(500).json({ message: 'Server error: could not update book' });
    }
};

exports.deleteBook = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCount = await Book.destroy({
            where: { book_id: id },
        });

        if(deletedCount === 0) {
            return res.status(404).json({ message: `Book with id ${id} not found.` });
        }

        res.status(200).json({ message: 'Book deleted successfully from local data store' });
    } catch (error) {
        console.error('Error deleting book: ', error);
        res.status(500).json({ message: 'Server error: could not delete book' });
    }
};


exports.syncExternalBook = async (req, res) => {
    const { title, description, cover_image_url, category } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Tiêu đề sách là bắt buộc.' });
    }

    const t = await sequelize.transaction();

    try {
        // tìm hoặc tạo Category "General" hoặc category từ API
        let [categoryObj] = await Category.findOrCreate({
            where: { name: category || 'General' },
            transaction: t
        });

        // kiểm tra xem sách tiêu đề này đã có trong database chưa
        let book = await Book.findOne({ where: { title: title }, transaction: t });

        if (!book) {
            // nếu chưa có, tạo sách mới để cấp ID Số (INT)
            book = await Book.create({
                title,
                description: description || "Thông tin đang cập nhật",
                cover_image_url: cover_image_url || "",
                price: 0,
                stock_quantity: 10,
                category_id: categoryObj.category_id,
                is_available: true
            }, { transaction: t });
        }

        await t.commit();
        
        res.status(200).json({
            message: 'Đồng bộ thành công',
            book_id: book.book_id 
        });
    } catch (error) {
        if (t) await t.rollback();
        console.error('Lỗi syncExternalBook:', error);
        res.status(500).json({ message: 'Lỗi server khi đăng ký sách ngoại.' });
    }
};