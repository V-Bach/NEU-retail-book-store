const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config'); 

const Loan = sequelize.define('Loan', {
    loan_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    book_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    borrow_date: {
        type: DataTypes.DATEONLY, 
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    // Ngày phải trả (Tính toán dựa trên loan_duration)
    due_date: { 
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    return_date: {
        type: DataTypes.DATEONLY,
        allowNull: true // Null nếu chưa trả
    },
    // Thời hạn mượn cố định (2, 5, hoặc 14 ngày)
    loan_duration: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isIn: [[2, 5, 14]] 
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'overdue', 'returned', 'cancelled'),
        allowNull: false,
        defaultValue: 'active'
    }
}, {
    tableName: 'Loans',
    timestamps: true 
});

module.exports = Loan;