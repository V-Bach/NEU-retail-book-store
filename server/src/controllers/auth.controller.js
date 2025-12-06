// server/src/controllers/auth.controller.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User Model (sẽ là Sequelize Model)


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; 


const createToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role }, // user.id, user.role (Thông tin sẽ lưu trong token)
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};


exports.register = async (req, res) => {
    // Thêm vai trò mặc định 'customer' nếu người dùng không gửi lên
    const { email, password, role = 'customer' } = req.body; 

    if(!email || !password) {
        // Sửa lỗi cú pháp JSON và message
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {

        const existingUser = await User.findOne({ where: { email } });
        if(existingUser) {
            return res.status(409).json({ message: 'email already existed' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // [3] Tạo User mới (Giả định: Role được lấy từ body hoặc mặc định 'customer')
        // *LƯU Ý QUAN TRỌNG: User.create() phải được gọi với AWAIT*
        const newUser = await User.create({ 
            email, 
            passwordHash: passwordHash, 
            role: role || 'customer' 
        });

        // [4] Trả về token cho người dùng
        const token = createToken(newUser);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            
            user: { id: newUser.id, email: newUser.email, role: newUser.role } 
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        res.status(500).json({ message: 'Server error during registration.' });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ where: { email } });

        if(!user) {
            // Thay đổi message để bảo mật hơn (không tiết lộ liệu email có tồn tại không)
            return res.status(401).json({ message: 'Invalid credentials.' }); 
        }
        
        // [2] So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if(!isMatch) {
            // Thay đổi message để bảo mật hơn
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        
        // [3] Tạo token và trả về
        const token = createToken(user);

        res.status(200).json({
            message: 'Login successful',
            token,
            // Đảm bảo role được trả về
            user: { id: user.id, email: user.email, role: user.role} 
        });
    } catch (error) {
        console.error('Login error', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};