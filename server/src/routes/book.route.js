// server/src/routes/book.route.js (ĐÃ SỬA LỖI VÀ TỐI ƯU CẤU TRÚC)

const express = require('express');
const router = express.Router();

// Import Controller
const bookController = require('../controllers/book.controller');

// Import Middleware (Đã được áp dụng chính xác cho các route bảo vệ)
const { authenticate, isAdmin } = require('../middleware/auth.middleware'); 


// 1. API công khai: Lấy danh sách tất cả sách từ database
// GET /api/books
router.get('/', bookController.getAllBooks);

// 2. API công khai: Lấy chi tiết sách từ database theo ID
// GET /api/books/:id
router.get('/:id', bookController.getBookById);

// 3. API cần phân quyền: Thêm sách mới (Chỉ Admin)
// POST /api/books (Đã bảo vệ bằng authenticate và isAdmin)
router.post('/', authenticate, isAdmin, bookController.createBook); 

// GET /api/books/external/search?q=query
router.get('/external/search', bookController.searchExternalBooks);

// GET /api/books/external/advanced?title=...&author=...
router.get('/external/advanced', bookController.advancedExternalSearch);

// GET /api/books/external/author?author=Stephen+King
router.get('/external/author', bookController.searchExternalByAuthor);

// GET /api/books/external/isbn?isbn=9780545010221
router.get('/external/isbn', bookController.searchExternalByISBN);

// GET /api/books/external/id/:googleId
router.get('/external/id/:googleId', bookController.getExternalBookById);

// 4. API cần phân quyền: CẬP NHẬT sách (Chỉ Admin - Cập nhật giá/tồn kho)
// PUT /api/books/:id
router.put('/:id', authenticate, isAdmin, bookController.updateBook); 

// 5. API cần phân quyền: XOÁ sách (Chỉ Admin)
// DELETE /api/books/:id
router.delete('/:id', authenticate, isAdmin, bookController.deleteBook); 


module.exports = router;