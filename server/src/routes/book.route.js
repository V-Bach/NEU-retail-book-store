// server/src/routes/book.route.js (ĐÃ SỬA LỖI CHÍNH TẢ)

const express = require('express');
const router = express.Router();

// Import Middleware
const { authenticate, isAdmin } = require('../middleware/auth.middleware'); 

// 1. API công khai (Public)
router.get('/', (req, res) => {
    res.status(200).json({ message: "Book routes are ready" });
});

// 2. API cần phân quyền (Protected - Admin Only)
router.post('/', authenticate, isAdmin, (req, res) => {
    res.status(201).json({ message: "Admin added a book" });
});

// Sửa lỗi chính tả: moudle.exports -> module.exports
module.exports = router;