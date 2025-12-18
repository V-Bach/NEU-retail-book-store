const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, cartController.addToCart);
router.get('/', authenticate, cartController.getCart);
// Thêm các route xóa/sửa item nếu cần

module.exports = router;