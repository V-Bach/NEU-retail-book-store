const express = require('express');
const router = express.Router();

// Import Controller
const bookController = require('../controllers/book.controller');

// Import Middleware
const { authenticate, isAdmin } = require('../middleware/auth.middleware'); 

// ========== CÁC ROUTE CHO TÌM KIẾM TỪ GOOGLE BOOKS API ==========

// 1. API tìm kiếm cơ bản từ Google Books (công khai)
// GET /api/books/external/search?q=query
router.get('/external/search', bookController.searchExternalBooks);

// 2. API tìm kiếm nâng cao từ Google Books (công khai)
// GET /api/books/external/advanced?title=...&author=...&isbn=...&publisher=...
router.get('/external/advanced', bookController.advancedExternalSearch);

// 3. API tìm kiếm theo tác giả từ Google Books (công khai)
// GET /api/books/external/author?author=Stephen+King
router.get('/external/author', bookController.searchExternalByAuthor);

// 4. API tìm kiếm theo ISBN từ Google Books (công khai)
// GET /api/books/external/isbn?isbn=9780545010221
router.get('/external/isbn', bookController.searchExternalByISBN);

// 5. API lấy chi tiết sách từ Google Books bằng ID (công khai)
// GET /api/books/external/id/:googleId
router.get('/external/id/:googleId', bookController.getExternalBookById);

// ========== CÁC ROUTE CHO QUẢN LÝ SÁCH TRONG DATABASE ==========

// 1. API công khai: Lấy danh sách tất cả sách từ database
// GET /api/books
router.get('/', bookController.getAllBooks);

// 2. API công khai: Lấy chi tiết sách từ database theo ID
// GET /api/books/:id
router.get('/:id', bookController.getBookById);

// 3. API cần phân quyền: Thêm sách mới (Chỉ Admin)
// POST /api/books
router.post('/', authenticate, isAdmin, bookController.createBook);

// Xuất Router
module.exports = router;