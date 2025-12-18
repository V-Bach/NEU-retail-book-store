const { CartItem, Book } = require('../models/index');

/**
 * THÊM VÀO GIỎ HÀNG (Mượn)
 */
exports.addToCart = async (req, res) => {
    const userId = req.user.id;
    const { book_id, quantity, is_borrowing } = req.body; // is_borrowing nhận true/false từ UI

    try {
        // Kiểm tra xem đã có mục này trong giỏ với cùng trạng thái chưa
        let item = await CartItem.findOne({
            where: { user_id: userId, book_id, is_borrowing }
        });

        if (item) {
            item.quantity += (quantity || 1);
            await item.save();
        } else {
            item = await CartItem.create({
                user_id: userId,
                book_id,
                quantity: quantity || 1,
                is_borrowing: is_borrowing || false
            });
        }

        res.status(200).json({ message: "Đã thêm vào giỏ hàng", item });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * XEM GIỎ HÀNG (Hiển thị tách biệt Mượn)
 */
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await CartItem.findAll({
            where: { user_id: userId },
            include: [{ model: Book, attributes: ['title', 'price', 'image'] }]
        });
        
        // Phân loại để Front-end dễ hiển thị
        const purchaseItems = items.filter(i => !i.is_borrowing);
        const borrowItems = items.filter(i => i.is_borrowing);

        res.status(200).json({ purchaseItems, borrowItems });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};