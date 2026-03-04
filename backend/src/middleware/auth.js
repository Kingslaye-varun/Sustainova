const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized — no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`🔐 Auth check: userId=${decoded.id}, role=${decoded.role}`);

        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: 'User not found or inactive' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);
        return res.status(401).json({ success: false, message: 'Token invalid or expired' });
    }
};

// Role-based access control
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            console.warn(`⛔ Access denied: user ${req.user.userId} (${req.user.role}) tried to access ${req.originalUrl}`);
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized for this resource`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
