// server/src/app.js (Phiên bản đã sửa)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db.config');

const app = express();

// --- 1. IMPORT ROUTES (Đưa lên đầu) ---
const authRouter = require('./routes/auth.route'); 
const bookRouter = require('./routes/book.route');

// --- 2. MIDDLEWARE (PHẢI LÀM VIỆC TRƯỚC ROUTES) ---
// Middleware bắt buộc: Để đọc dữ liệu JSON gửi từ Front-end
app.use(express.json()); 
// Middleware bắt buộc: Cho phép Front-end gọi API từ cổng khác
app.use(cors()); 

// --- 3. ĐỊNH NGHĨA CÁC ROUTES ---
// Route Xác thực (Auth)
app.use('/api/auth', authRouter); 
// Route Quản lý Sách (Book)
app.use('/api/books', bookRouter); 

// Route cơ bản (Luôn để ở cuối nhóm route để tránh xung đột)
app.get('/', (req, res) => {
    res.send('retail book store API is running!');
});


const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`); 
        console.log(`JWT secret loaded: ${!!process.env.JWT_SECRET}`);
    });
}). catch(err => {
    console.error("Failed to start server due to database error:", err);
    process.exit(1);
});