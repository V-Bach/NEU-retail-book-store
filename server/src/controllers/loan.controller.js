const { Loan, CartItem, Book } = require('../models/index');
const { sequelize } = require('../config/db.config'); 
const { Op } = require('sequelize');
const moment = require('moment'); 

const getUserId = (req) => req.user.id;

exports.checkoutLoan = async (req, res) => {
    const userId = getUserId(req);
    const { bookIds, duration } = req.body; 

    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
        return res.status(400).json({ message: 'Danh sách sách mượn không hợp lệ.' });
    }

    if (![7, 14].includes(Number(duration))) {
        return res.status(400).json({ message: 'Thời hạn mượn không hợp lệ (7 hoặc 14 ngày).' });
    }

    const t = await sequelize.transaction();

    try {
        const loanRecords = [];
        const dueDate = moment().add(duration, 'days').format('YYYY-MM-DD');
        const today = moment().format('YYYY-MM-DD');

        for (const bookId of bookIds) {
            const book = await Book.findByPk(bookId, { transaction: t });
            
            if (!book) {
                await t.rollback();
                return res.status(404).json({ message: `Không tìm thấy sách ID: ${bookId}` });
            }

            if (book.stock_quantity <= 0) {
                 await t.rollback();
                 return res.status(400).json({ message: `Sách "${book.title}" đã hết hàng.` });
            }

            loanRecords.push({
                user_id: userId,
                book_id: bookId,
                loan_duration: duration,
                borrow_date: today,
                due_date: dueDate,
                status: 'active'
            });

            
            await book.decrement('stock_quantity', { by: 1, transaction: t });
        }

    
        await Loan.bulkCreate(loanRecords, { transaction: t });


        if (CartItem) {
            await CartItem.destroy({
                where: { 
                    user_id: userId,
                    book_id: { [Op.in]: bookIds },
                    is_borrowing: true 
                },
                transaction: t
            });
        }

        await t.commit();
        res.status(201).json({ message: 'Thành công', due_date: dueDate });

    } catch (error) {
        if (t) await t.rollback();
        console.error("Lỗi tại checkoutLoan:", error);
        res.status(500).json({ message: 'Lỗi server khi mượn sách.' });
    }
};

exports.getLoanReminders = async (req, res) => {
    try {
        const userId = getUserId(req);
        const today = moment().startOf('day');

        const loans = await Loan.findAll({
            where: { 
                user_id: userId, 
                status: { [Op.in]: ['active', 'overdue'] } 
            },
            include: [{ model: Book, as: 'borrowed_book', attributes: ['title'] }]
        });
        
        const reminders = loans.reduce((acc, loan) => {
            const batchKey = `${loan.borrow_date}_${loan.loan_duration}`;
            
            if (!acc[batchKey]) {
                const dueDate = moment(loan.due_date).startOf('day');
                const daysRemaining = dueDate.diff(today, 'days');

                let alertType = 'NORMAL';
                let message = `Còn ${daysRemaining} ngày để trả sách.`;

                if (daysRemaining < 0) {
                    alertType = 'DANGER';
                    message = `Đã quá hạn trả ${Math.abs(daysRemaining)} ngày! Hãy trả sớm nhé.`;
                } else if (daysRemaining === 0) {
                    alertType = 'WARNING';
                    message = `Hôm nay là hạn trả sách cuối cùng của bạn!`;
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
            if (loan.borrowed_book) {
                acc[batchKey].books.push(loan.borrowed_book.title);
            }
            return acc;
        }, {});

        res.status(200).json({
            reminders: Object.values(reminders).sort((a, b) => a.days_remaining - b.days_remaining)
        });
    } catch (error) {
        console.error("Lỗi getLoanReminders:", error);
        res.status(500).json({ message: 'Lỗi tính toán nhắc nhở.' });
    }
};


exports.returnLoan = async (req, res) => {
    const userId = getUserId(req);
    const { loanId } = req.params;
    const today = moment().format('YYYY-MM-DD');

    const t = await sequelize.transaction();
    try {
        const loan = await Loan.findOne({
            where: { loan_id: loanId, user_id: userId },
            transaction: t
        });

        if (!loan || loan.status === 'returned') {
            await t.rollback();
            return res.status(400).json({ message: 'Khoản mượn không tồn tại hoặc đã được trả.' });
        }

    
        await loan.update({ 
            status: 'returned', 
            return_date: today 
        }, { transaction: t });

       
        await Book.increment(
            { stock_quantity: 1 },
            { where: { book_id: loan.book_id }, transaction: t }
        );

        await t.commit();
        res.status(200).json({ message: 'Đã trả sách thành công. Cảm ơn bạn!' });
    } catch (error) {
        if (t) await t.rollback();
        console.error("Lỗi returnLoan:", error);
        res.status(500).json({ message: 'Lỗi khi trả sách.' });
    }
};

exports.getActiveLoans = async (req, res) => {
    try {
        const userId = getUserId(req);
        const activeLoans = await Loan.findAll({
            where: { 
                user_id: userId, 
                status: { [Op.in]: ['active', 'overdue'] } 
            },
            include: [{ 
                model: Book, 
                as: 'borrowed_book', 
                attributes: ['title', 'book_id', 'cover_image_url'] 
            }],
            order: [['due_date', 'ASC']]
        });
        res.status(200).json({ loans: activeLoans });
    } catch (error) {
        console.error("Lỗi getActiveLoans:", error);
        res.status(500).json({ message: 'Lỗi lấy danh sách mượn.' });
    }
};

exports.getLoanHistory = async (req, res) => {
    try {
        const userId = req.user.id; 
        const history = await Loan.findAll({
            where: { user_id: userId },
            include: [{ 
                model: Book, 
                as: 'borrowed_book', 
                attributes: ['title', 'cover_image_url', 'book_id'] 
            }],
            order: [['createdAt', 'DESC']] 
        });
        res.status(200).json({ history });
    } catch (error) {
        console.error("Lỗi getLoanHistory:", error);
        res.status(500).json({ message: 'Lỗi khi lấy lịch sử mượn sách.' });
    }
};