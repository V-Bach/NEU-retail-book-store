require('dotenv').config();
const express = require('express');
const cors = require('cors');


const { connectDB } = require('./config/db.config');
const { sequelize } = require('./config/db.config');

// IMPORT ROUTES
const authRouter = require('./routes/auth.route'); 
const bookRouter = require('./routes/book.route'); 
const reviewRoutes = require('./routes/review.route');
const loanRoutes = require('./routes/loan.route');
const cartRouter = require('./routes/cart.route'); 


const app = express();
const PORT = process.env.PORT || 5000;


// frontend goi api
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
})); 
// doc du lieu json
app.use(express.json()); 


// Route xac thuc
app.use('/api/auth', authRouter); 

// Route quan ly sach
app.use('/api/books', bookRouter); 

// Route review sach
app.use('/api/reviews', reviewRoutes);

// Route muon sach
app.use('/api/loans', loanRoutes);

// Route gio sach
app.use('/api/cart', cartRouter);


// 
app.get('/', (req, res) => {
    res.send('retail book store API is running!');
});


async function startServer() {
    try {
        await connectDB();
        console.log("Database connection successful");

        await sequelize.sync({ force: false }); 
        
        console.log("Database synchronized successfully (New tables created)");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server due to database error", error);
        process.exit(1);
    }
}

startServer();