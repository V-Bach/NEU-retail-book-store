// server/src/routes/loan.route.js

const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');
const { authenticate } = require('../middleware/auth.middleware');

// cần xác thực trước rồi mới dùng được route

// POST /api/loans/checkout: Chuyển các mục mượn trong giỏ thành khoản mượn chính thức
router.post('/checkout', authenticate, loanController.checkoutLoan);

// GET /api/loans/reminders: Lấy thông tin nhắc nhở
router.get('/reminders', authenticate, loanController.getLoanReminders);

// GET /api/loans: Lấy danh sách tất cả sách đang mượn (active/overdue)
router.get('/', authenticate, loanController.getActiveLoans);

// PUT /api/loans/return/:loanId: Đánh dấu sách đã trả và cập nhật kho
router.put('/return/:loanId', authenticate, loanController.returnLoan); 


module.exports = router;