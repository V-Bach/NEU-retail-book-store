const { Loan, CartItem, Book } = require('../models/index');
const { sequelize } = require('../config/db.config'); 
const { Op } = require('sequelize');
const moment = require('moment'); 

// Cài đặt thư viện moment để xử lý ngày tháng dễ dàng hơn:
// npm install moment

const getUserId = (req) => req.user.id;
const MAX_LOAN_DURATION = 14;

/**
 * Hàm tính toán ngày trả (Due Date)
 * @param {number} duration - Thời hạn mượn (2, 5, 14 ngày)
 * @returns {Date} Ngày phải trả sách
 */
const calculateDueDate = (duration) => {
    // Sử dụng thư viện moment để thêm số ngày vào ngày hiện tại
    return moment().add(duration, 'days').format('YYYY-MM-DD');
};


/**
 * MƯỢN SÁCH (CHECKOUT) (POST /api/loans/checkout)
 * Chuyển các mục có is_borrowing=true từ CartItems sang bảng Loans.
 */
exports.checkoutLoan = async (req, res) => {
    const userId = getUserId(req);
    const { duration } = req.body; // Thời hạn mượn: 2, 5, hoặc 14 ngày

    // 1. Kiểm tra thời hạn mượn hợp lệ
    if (![2, 5, MAX_LOAN_DURATION].includes(duration) || duration > MAX_LOAN_DURATION) {
        return res.status(400).json({ 
            message: `Invalid loan duration. Must be 2, 5, or ${MAX_LOAN_DURATION} days.` 
        });
    }

    const t = await sequelize.transaction();

    try {
        // 2. Lấy tất cả mục sách MƯỢN của người dùng trong Giỏ hàng
        const itemsToLoan = await CartItem.findAll({
            where: { user_id: userId, is_borrowing: true },
            include: [{ model: Book, as: 'book', attributes: ['book_id', 'stock_quantity'] }],
            transaction: t
        });

        if (itemsToLoan.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'No items marked for borrowing found in cart.' });
        }

        const loanRecords = [];
        const booksToUpdateStock = [];
        const dueDate = calculateDueDate(duration); // Tính ngày trả

        // 3. Xử lý từng mục: Tạo bản ghi Loan và Giảm Stock
        for (const item of itemsToLoan) {
            // Kiểm tra stock trước khi mượn (đảm bảo atomic)
            if (item.book.stock_quantity < item.quantity) {
                 await t.rollback();
                 return res.status(400).json({ message: `Insufficient stock for book ID ${item.book_id}.` });
            }
            
            // Tạo bản ghi Loan
            for (let i = 0; i < item.quantity; i++) { // Tạo 1 bản ghi Loan cho mỗi đơn vị
                loanRecords.push({
                    user_id: userId,
                    book_id: item.book_id,
                    loan_duration: duration,
                    borrow_date: moment().format('YYYY-MM-DD'),
                    due_date: dueDate,
                    status: 'active'
                });
            }
            
            // Lưu thông tin giảm Stock
            booksToUpdateStock.push({
                book_id: item.book_id,
                quantityChange: item.quantity
            });
        }

        // 4. Tạo các bản ghi Loan mới
        await Loan.bulkCreate(loanRecords, { transaction: t });

        // 5. Cập nhật Stock (Giảm số lượng sách)
        for (const update of booksToUpdateStock) {
            await Book.increment(
                { stock_quantity: -update.quantityChange },
                { where: { book_id: update.book_id }, transaction: t }
            );
        }

        // 6. Xóa các mục MƯỢN khỏi Giỏ hàng
        await CartItem.destroy({
            where: { user_id: userId, is_borrowing: true },
            transaction: t
        });

        await t.commit(); // Cam kết giao dịch

        res.status(201).json({
            message: 'Loan checkout successful. Items moved from cart to loans.',
            loan_count: loanRecords.length,
            due_date: dueDate
        });

    } catch (error) {
        await t.rollback();
        console.error('Error during loan checkout:', error);
        res.status(500).json({ message: 'Server error: Could not process loan checkout.' });
    }
};

/**
 * XEM DANH SÁCH SÁCH ĐANG MƯỢN (GET /api/loans)
 * Lấy tất cả các khoản mượn của người dùng hiện tại (active/overdue).
 */
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
                attributes: ['title', 'book_id'] 
            }],
            order: [['due_date', 'ASC']]
        });
        
        res.status(200).json({
            message: 'Active loans retrieved successfully.',
            loans: activeLoans
        });

    } catch (error) {
        console.error('Error fetching active loans:', error);
        res.status(500).json({ message: 'Server error: Could not retrieve active loans.' });
    }
};


/**
 * TÍNH TOÁN VÀ THÔNG BÁO NHẮC NHỞ (GET /api/loans/reminders)
 * Trả về thông tin nhắc nhở: Số ngày còn lại để trả sách.
 */
exports.getLoanReminders = async (req, res) => {
    try {
        const userId = getUserId(req);
        const today = moment().startOf('day');

        // Lấy tất cả các khoản mượn đang hoạt động của người dùng
        const loans = await Loan.findAll({
            where: { user_id: userId, status: 'active' },
            include: [{ model: Book, as: 'borrowed_book', attributes: ['title'] }]
        });
        
        const reminders = loans.map(loan => {
            const dueDate = moment(loan.due_date).startOf('day');
            // Tính toán số ngày còn lại (làm tròn lên)
            const daysRemaining = dueDate.diff(today, 'days'); 

            let reminderStatus = 'Active';

            if (daysRemaining < 0) {
                reminderStatus = 'OVERDUE';
            } else if (daysRemaining === 0) {
                reminderStatus = 'DUE TODAY';
            } else if (daysRemaining <= 2) { // Ví dụ nhắc nhở 2 ngày cuối
                reminderStatus = 'URGENT (2 days or less)';
            }
            
            return {
                loan_id: loan.loan_id,
                book_title: loan.borrowed_book.title,
                due_date: loan.due_date,
                days_remaining: daysRemaining,
                status: reminderStatus
            };
        }).sort((a, b) => a.days_remaining - b.days_remaining); // Sắp xếp theo ngày gần nhất

        res.status(200).json({
            message: 'Loan reminders calculated.',
            reminders
        });
    } catch (error) {
        console.error('Error calculating reminders:', error);
        res.status(500).json({ message: 'Server error: Could not calculate reminders.' });
    }
};

/**
 * TRẢ SÁCH (RETURN LOAN) (PUT /api/loans/return/:loanId)
 * Đánh dấu sách đã được trả và tăng số lượng tồn kho.
 */
exports.returnLoan = async (req, res) => {
    const userId = getUserId(req);
    const { loanId } = req.params;
    const today = moment().format('YYYY-MM-DD');

    const t = await sequelize.transaction();

    try {
        // 1. Tìm khoản mượn và kiểm tra quyền sở hữu
        const loan = await Loan.findOne({
            where: { loan_id: loanId, user_id: userId }
        });

        if (!loan) {
            await t.rollback();
            return res.status(404).json({ message: 'Loan record not found or does not belong to user.' });
        }

        // 2. Kiểm tra trạng thái: chỉ cho phép trả các khoản đang active/overdue
        if (loan.status === 'returned') {
            await t.rollback();
            return res.status(400).json({ message: 'This book has already been returned.' });
        }

        // 3. Cập nhật trạng thái Loan
        await loan.update({
            status: 'returned',
            return_date: today
        }, { transaction: t });

        // 4. Cập nhật Stock (Tăng số lượng sách)
        await Book.increment(
            { stock_quantity: 1 }, // Tăng tồn kho lên 1 đơn vị
            { where: { book_id: loan.book_id }, transaction: t }
        );

        await t.commit(); // Cam kết giao dịch

        // 5. Tính phí phạt (Tùy chọn)
        let penaltyMessage = '';
        const dueDate = moment(loan.due_date);
        const actualReturnDate = moment(today);
        const daysOverdue = actualReturnDate.diff(dueDate, 'days');

        if (daysOverdue > 0) {
            // Logic tính phí phạt có thể được thêm ở đây (ví dụ: daysOverdue * [số tiền phạt])
            penaltyMessage = `Note: Book was returned ${daysOverdue} day(s) overdue. Penalty may apply.`;
        }

        res.status(200).json({
            message: 'Book successfully returned and stock updated.',
            loan_id: loanId,
            return_date: today,
            penalty_note: penaltyMessage
        });

    } catch (error) {
        await t.rollback();
        console.error('Error processing loan return:', error);
        res.status(500).json({ message: 'Server error: Could not process book return.' });
    }
};