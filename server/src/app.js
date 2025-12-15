// server/src/app.js (Phiên bản đã sửa)

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- 1. import cau hinh ---
const { connectDB } = require('./config/db.config');
const { sequelize } = require('./config/db.config');
const reviewRoutes = require('./routes/review.route');
const authRouter = require('./routes/auth.route'); 
const bookRouter = require('./routes/book.route');
const cartRoutes = require('./routes/cart.route');
const loanRoutes = require('./routes/loan.route');

const app = express();
const PORT = process.env.PORT || 5000;


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
// api review sach
app.use('/api/reviews', reviewRoutes);

//route cart
app.use('/api/cart', cartRoutes);

//route loan
app.use('/api/loans', loanRoutes);

// Route cơ bản (Luôn để ở cuối nhóm route để tránh xung đột)
app.get('/', (req, res) => {
    res.send('retail book store API is running!');
});


async function startServer() {
    try {
        await connectDB();
        console.log("Database connection successful");

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