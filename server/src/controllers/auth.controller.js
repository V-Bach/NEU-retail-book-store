const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

const createToken = (user) => {
    return jwt.sign(
        { id: user.user_id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1d' }
    );
};

exports.register = async (req, res) => {
    const { email, password, first_name, last_name, role = 'customer' } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc.' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email đã tồn tại.' });
        }

        const newUser = await User.create({
            email,
            password, 
            first_name,
            last_name,
            role
        });

        const token = createToken(newUser);
        res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user: { id: newUser.user_id, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Thông tin đăng nhập không chính xác.' });
        }

        const token = createToken(user);
        res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
            user: { id: user.user_id, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    }
};