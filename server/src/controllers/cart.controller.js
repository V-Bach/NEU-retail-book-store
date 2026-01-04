const { CartItem, Book } = require('../models/index');

exports.addToCart = async (req, res) => {
    const userId = req.user.id;
    const { book_id, quantity, is_borrowing } = req.body; 

    try {
       
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


exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await CartItem.findAll({
            where: { user_id: userId },
            include: [{ model: Book, attributes: ['title', 'price', 'image'] }]
        });
        
      
        const purchaseItems = items.filter(i => !i.is_borrowing);
        const borrowItems = items.filter(i => i.is_borrowing);

        res.status(200).json({ purchaseItems, borrowItems });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};