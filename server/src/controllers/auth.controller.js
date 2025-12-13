// server/src/controllers/auth.controller.js

const jwt = require('jsonwebtoken');
const  { User } = require('../models/index');


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; 

// Make sure to use the correct primary key
const createToken = (user) => {
    return jwt.sign(
        { id: user.user_id || user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};


exports.register = async (req, res) => {
    // Thêm vai trò mặc định 'user' (thay vì 'customer' để nhất quán với ENUM trong DB)
    const { email, password, role = 'user' } = req.body; 

    if(!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if(existingUser) {
            return res.status(409).json({ message: 'Email already exists.' });
        }

        // [QUAN TRỌNG] Model Hook (beforeCreate) sẽ tự động băm mật khẩu này
        const newUser = await User.create({ 
            email, 
            password: password, // <-- Sửa: Dùng trường 'password'
            role: role 
        });

        const token = createToken(newUser);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            // Sử dụng user_id để trả về cho client
            user: { id: newUser.user_id || newUser.id, email: newUser.email, role: newUser.role } 
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
            return res.status(401).json({ message: 'Invalid credentials.' }); 
        }
        
        // [SỬA] Sử dụng phương thức comparePassword của Model
        const isMatch = await user.comparePassword(password); 

        if(!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        
        const token = createToken(user);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user.user_id || user.id, email: user.email, role: user.role} 
        });
    } catch (error) {
        console.error('Login error', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};