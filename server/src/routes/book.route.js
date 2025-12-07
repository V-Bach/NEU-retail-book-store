const express = require('express');
const router = express.Router();

// Import Controller
const bookController = require('../controllers/book.controller'); // <-- BƯỚC 1

// Import Middleware
const { authenticate, isAdmin } = require('../middleware/auth.middleware'); 

// API công khai: tìm kiếm sách bên ngoài
// Endpoint: GET /api/books/external-search?q=query
router.get('/external-search', bookController.searchExternalBooks);

// 1. API công khai (READ ALL): Lấy danh sách tất cả sách
// Ví dụ: GET /api/books
// *Lưu ý: Bạn sẽ cần tạo hàm getAllBooks trong Controller
router.get('/', bookController.getAllBooks); // <-- Cập nhật để gọi hàm Controller

// 2. API cần phân quyền (CREATE): Thêm sách mới (Chỉ Admin)
// Ví dụ: POST /api/books
router.post('/', authenticate, isAdmin, bookController.createBook); // <-- Cập nhật để gọi hàm Controller

// 3. API CÔNG KHAI: Lấy chi tiết sách theo ID
// Ví dụ: GET /api/books/12
router.get('/:id', bookController.getBookById); // <-- THÊM DÒNG NÀY

// Xuất Router
module.exports = router;