// server/src/app.js (Phiên bản Đã Sửa)

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- 1. IMPORT CẤU HÌNH VÀ MODELS/ROUTES ---
const { connectDB } = require('./config/db.config');
const { sequelize } = require('./config/db.config');

// IMPORT ROUTES
const authRouter = require('./routes/auth.route'); 
const bookRouter = require('./routes/book.route'); // <--- ĐÃ THÊM DÒNG NÀY ĐỂ KHẮC PHỤC LỖI
const reviewRoutes = require('./routes/review.route');
const loanRoutes = require('./routes/loan.route');

const app = express();
const PORT = process.env.PORT || 5000;


// --- 2. MIDDLEWARE ---
// Cho phép Front-end gọi API từ cổng khác
app.use(cors()); 
// Để đọc dữ liệu JSON gửi từ Front-end
app.use(express.json()); 


// --- 3. ĐỊNH NGHĨA CÁC ROUTES ---

// Route Xác thực (Auth)
app.use('/api/auth', authRouter); 

// Route Quản lý Sách (Book)
app.use('/api/books', bookRouter); 

// Route Review Sách
app.use('/api/reviews', reviewRoutes);

// Route Loan (Mượn sách)
app.use('/api/loans', loanRoutes);


// Route cơ bản (Luôn để ở cuối nhóm route để tránh xung đột)
app.get('/', (req, res) => {
    res.send('retail book store API is running!');
});


/**
 * Khởi động Server và kết nối Database
 */
async function startServer() {
    try {
        // Kết nối cơ sở dữ liệu (MongoDB)
        await connectDB();
        console.log("Database connection successful");

        // Đồng bộ hóa Sequelize (Tạo/Cập nhật bảng trong SQL)
        await sequelize.sync({ alter: true });
        console.log("Database synchronized successfully (table created/updated)");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`JWT secret loaded: ${!!process.env.JWT_SECRET}`);
         });
    } catch (error) {
        console.error("Failed to start server due to database error", error);

        process.exit(1);
    }
}

startServer();