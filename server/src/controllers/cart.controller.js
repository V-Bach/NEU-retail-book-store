const { CartItem, Book, User } = require('../models/index');
const { Op } = require('sequelize');

const getUserId = (req) => req.user.id;

// GET /api/cart
// xem gio hang
exports.getCart = async (req, res) => {
    try {
        const userId = getUserId(req);

        const cartItems = await CartItem.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Book,
                    as: 'book', // Tên alias trong quan hệ
                    attributes: ['book_id', 'title', 'price', 'stock_quantity'] // Chỉ lấy thông tin cần thiết
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            message: 'Cart retrieved successfully.',
            total_items: cartItems.length,
            cart: cartItems
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error: Could not retrieve cart.' });
    }
};

// POST /api/cart
// them sach vao gio hang, neu sach da ton tai thi +1
exports.addToCart = async (req, res) => {
    const userId = getUserId(req);
    const { book_id, quantity = 1, is_borrowing = false } = req.body;

    if (!book_id) {
        return res.status(400).json({ message: 'book_id is required.' });
    }
    
    // Đảm bảo sách tồn tại và còn hàng (Kiểm tra Stock)
    const book = await Book.findByPk(book_id, { attributes: ['stock_quantity'] });
    if (!book) {
        return res.status(404).json({ message: 'Book not found.' });
    }
    if (book.stock_quantity < quantity) {
        return res.status(400).json({ message: `Only ${book.stock_quantity} item(s) available in stock.` });
    }

    try {
        // Kiểm tra xem mục này đã có trong giỏ với cùng trạng thái MUA/MƯỢN chưa
        let cartItem = await CartItem.findOne({
            where: {
                user_id: userId,
                book_id: book_id,
                is_borrowing: is_borrowing // PHÂN BIỆT MUA VÀ MƯỢN
            }
        });

        if (cartItem) {
            // Mục đã tồn tại, cập nhật số lượng
            cartItem.quantity += quantity;
            await cartItem.save();
            message = 'Quantity updated in cart.';
        } else {
            // Tạo mục mới
            cartItem = await CartItem.create({
                user_id: userId,
                book_id: book_id,
                quantity: quantity,
                is_borrowing: is_borrowing
            });
            message = 'Item added to cart.';
        }

        res.status(200).json({ message, cartItem });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Server error: Could not add item to cart.' });
    }
};

// PUT /api/cart/:itemId
// cap nhat so luong cua 1 muc gio hang
exports.updateCartItemQuantity = async (req, res) => {
    const userId = getUserId(req);
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    try {
        const [updated] = await CartItem.update(
            { quantity: quantity },
            {
                where: { cart_item_id: itemId, user_id: userId } // Bắt buộc phải là của user hiện tại
            }
        );

        if (updated === 0) {
            return res.status(404).json({ message: 'Cart item not found or does not belong to user.' });
        }

        const updatedItem = await CartItem.findByPk(itemId);
        res.status(200).json({ message: 'Cart item quantity updated successfully.', cartItem: updatedItem });

    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Server error: Could not update cart item.' });
    }
};


// DELETE /api/cart/:itemId
// xoa muc khoi gio
exports.removeCartItem = async (req, res) => {
    const userId = getUserId(req);
    const { itemId } = req.params;

    try {
        const deleted = await CartItem.destroy({
            where: { cart_item_id: itemId, user_id: userId } // Bắt buộc phải là của user hiện tại
        });

        if (deleted === 0) {
            return res.status(404).json({ message: 'Cart item not found or does not belong to user.' });
        }

        res.status(200).json({ message: 'Cart item removed successfully.' });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ message: 'Server error: Could not remove cart item.' });
    }
};


// DELETE /api/cart
// reset lai gio hang

exports.clearCart = async (req, res) => {
    const userId = getUserId(req);

    try {
        await CartItem.destroy({
            where: { user_id: userId }
        });

        res.status(200).json({ message: 'Cart cleared successfully.' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Server error: Could not clear cart.' });
    }
};