const { Loan, CartItem, Book } = require('../models/index');
const { sequelize } = require('../config/db.config'); 
const { Op } = require('sequelize');
const moment = require('moment'); 

const getUserId = (req) => req.user.id;

/**
 * 1. MƯỢN SÁCH (CHECKOUT) - Giữ nguyên logic 7/14 ngày
 */
exports.checkoutLoan = async (req, res) => {
    const userId = getUserId(req);
    const { duration } = req.body; 

    if (![7, 14].includes(duration)) {
        return res.status(400).json({ 
            message: `Thời hạn mượn không hợp lệ. Bạn chỉ có thể chọn 7 hoặc 14 ngày.` 
        });
    }

    const t = await sequelize.transaction();

    try {
        const itemsToLoan = await CartItem.findAll({
            where: { user_id: userId, is_borrowing: true },
            include: [{ model: Book, as: 'book', attributes: ['book_id', 'stock_quantity'] }],
            transaction: t
        });

        if (itemsToLoan.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Giỏ mượn của bạn đang trống.' });
        }

        const loanRecords = [];
        const booksToUpdateStock = [];
        const dueDate = moment().add(duration, 'days').format('YYYY-MM-DD');

        for (const item of itemsToLoan) {
            if (item.book.stock_quantity < item.quantity) {
                 await t.rollback();
                 return res.status(400).json({ message: `Sách ${item.book_id} đã hết hàng.` });
            }
            
            for (let i = 0; i < item.quantity; i++) {
                loanRecords.push({
                    user_id: userId,
                    book_id: item.book_id,
                    loan_duration: duration,
                    borrow_date: moment().format('YYYY-MM-DD'),
                    due_date: dueDate,
                    status: 'active'
                });
            }
            
            booksToUpdateStock.push({
                book_id: item.book_id,
                quantityChange: item.quantity
            });
        }

        await Loan.bulkCreate(loanRecords, { transaction: t });

        for (const update of booksToUpdateStock) {
            await Book.increment(
                { stock_quantity: -update.quantityChange },
                { where: { book_id: update.book_id }, transaction: t }
            );
        }

        await CartItem.destroy({
            where: { user_id: userId, is_borrowing: true },
            transaction: t
        });

        await t.commit();

        res.status(201).json({
            message: 'Xác nhận mượn sách thành công.',
            due_date: dueDate
        });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Lỗi server khi mượn sách.' });
    }
};

/**
 * 2. NHẮC NHỞ CHỦ ĐỘNG (NHÓM THEO LẦN MƯỢN)
 * Tập trung vào cảnh báo thời gian, KHÔNG phí phạt.
 */
exports.getLoanReminders = async (req, res) => {
    try {
        const userId = getUserId(req);
        const today = moment().startOf('day');

        const loans = await Loan.findAll({
            where: { user_id: userId, status: { [Op.in]: ['active', 'overdue'] } },
            include: [{ model: Book, as: 'borrowed_book', attributes: ['title'] }]
        });
        
        const reminders = loans.reduce((acc, loan) => {
            const batchKey = `${loan.borrow_date}_${loan.loan_duration}`;
            
            if (!acc[batchKey]) {
                const dueDate = moment(loan.due_date).startOf('day');
                const daysRemaining = dueDate.diff(today, 'days');

                // Logic cảnh báo theo mức độ
                let alertType = 'NORMAL';
                let message = `Còn ${daysRemaining} ngày để trả sách.`;

                if (daysRemaining < 0) {
                    alertType = 'DANGER';
                    message = `Đã quá hạn trả ${Math.abs(daysRemaining)} ngày! Hãy trả sớm nhé.`;
                } else if (daysRemaining === 0) {
                    alertType = 'WARNING';
                    message = `Sắp đến hạn ròiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii`;
                } else if (daysRemaining <= 2) {
                    alertType = 'URGENT';
                    message = `Sắp đến hạn! Bạn chỉ còn ${daysRemaining} ngày.`;
                }

                acc[batchKey] = {
                    borrow_date: loan.borrow_date,
                    due_date: loan.due_date,
                    days_remaining: daysRemaining,
                    books: [],
                    alert_type: alertType,
                    display_message: message
                };
            }
            acc[batchKey].books.push(loan.borrowed_book.title);
            return acc;
        }, {});

        res.status(200).json({
            reminders: Object.values(reminders).sort((a, b) => a.days_remaining - b.days_remaining)
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tính toán nhắc nhở.' });
    }
};

/**
 * 3. TRẢ SÁCH (RETURN LOAN)
 * Chỉ cập nhật trạng thái và kho, KHÔNG tính phí phạt.
 */
exports.returnLoan = async (req, res) => {
    const userId = getUserId(req);
    const { loanId } = req.params;
    const today = moment().format('YYYY-MM-DD');

    const t = await sequelize.transaction();
    try {
        const loan = await Loan.findOne({
            where: { loan_id: loanId, user_id: userId }
        });

        if (!loan || loan.status === 'returned') {
            await t.rollback();
            return res.status(400).json({ message: 'Khoản mượn không tồn tại hoặc đã được trả.' });
        }

        await loan.update({ status: 'returned', return_date: today }, { transaction: t });

        await Book.increment(
            { stock_quantity: 1 },
            { where: { book_id: loan.book_id }, transaction: t }
        );

        await t.commit();
        res.status(200).json({ message: 'Đã trả sách thành công. Cảm ơn bạn!' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Lỗi khi trả sách.' });
    }
};

/**
 * 4. XEM DANH SÁCH 
 */
exports.getActiveLoans = async (req, res) => {
    try {
        const userId = getUserId(req);
        const activeLoans = await Loan.findAll({
            where: { user_id: userId, status: { [Op.in]: ['active', 'overdue'] } },
            include: [{ model: Book, as: 'borrowed_book', attributes: ['title', 'book_id'] }],
            order: [['due_date', 'ASC']]
        });
        res.status(200).json({ loans: activeLoans });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách mượn.' });
    }
};