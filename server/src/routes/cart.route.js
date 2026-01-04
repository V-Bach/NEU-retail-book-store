const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, cartController.addToCart);
router.get('/', authenticate, cartController.getCart);


module.exports = router;