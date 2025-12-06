const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.authenticate = (req, res, next) => {
    const authHeader = req.headers.authorizaiton;

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'authorization token not provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

exports.isAdmin = (req, res, next) => {
    if(req.user && req.user.role == 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'access denied: requires administrator privileges' });
    }
};