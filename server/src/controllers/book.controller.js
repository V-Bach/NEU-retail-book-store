// server/src/controllers/book.controller.js

const { Book, Category, Author } = require('../models/index');
const { sequelize } = require('../config/db.config'); // Dùng cho transaction

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
            // Có thể thêm include: [Author, Category] để trả về chi tiết hơn
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
            // Sử dụng "include" để lấy dữ liệu từ các bảng quan hệ
            include: [
                {
                    model: Category, // Lấy thông tin Thể loại (quan hệ 1:N)
                    as: 'category', // Phải khớp với alias đã đặt trong index.js
                    attributes: ['name'] // Chỉ lấy trường 'name' của Category
                },
                {
                    model: Author, // Lấy thông tin Tác giả (quan hệ N:M)
                    as: 'authors', // Phải khớp với alias đã đặt trong index.js
                    // Chỉ lấy tên
                    attributes: ['author_id', 'first_name', 'last_name'],
                    // Loại bỏ bảng trung gian khỏi kết quả trả về
                    through: { attributes: [] } 
                }
            ],
            // Sắp xếp theo tiêu đề
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
            // Bao gồm thông tin Category và Author (giống như getAllBooks)
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