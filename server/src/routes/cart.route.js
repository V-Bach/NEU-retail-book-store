const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../middleware/auth.middleware');

// cần xác thực người dùng trước khi sử dụng route

// Lấy giỏ hàng / Xóa toàn bộ giỏ hàng
router.route('/')
    .get(authenticate, cartController.getCart)      
    .post(authenticate, cartController.addToCart)   
    .delete(authenticate, cartController.clearCart); 

// Cập nhật/Xóa mục cụ thể
router.route('/:itemId')
    .put(authenticate, cartController.updateCartItemQuantity)
    .delete(authenticate, cartController.removeCartItem);    

module.exports = router;