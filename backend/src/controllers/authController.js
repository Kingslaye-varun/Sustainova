const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, userId: user.userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// POST /api/auth/register  — EMPLOYEES ONLY
const register = async (req, res) => {
    try {
        const { name, email, password, department, floor } = req.body;
        console.log(`📝 Register attempt: ${email} (locked to employee role)`);

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // ⚠️ Role is ALWAYS 'employee' for public registration.
        // Admin/Maintenance/Visitor are created by Admin only.
        const user = await User.create({
            name, email, password,
            role: 'employee',
            department: department || 'General',
            floor: parseInt(floor) || 1,
        });
        const token = generateToken(user);

        console.log(`✅ Employee registered: ${user.userId} (${user.name})`);
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                userId: user.userId, name: user.name, email: user.email,
                role: user.role, department: user.department, floor: user.floor,
            },
        });
    } catch (error) {
        console.error('❌ Register error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};



// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`🔑 Login attempt: ${email}`);

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.warn(`⚠️ Login failed — user not found: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.warn(`⚠️ Login failed — wrong password for: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        user.lastSeen = new Date();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user);
        console.log(`✅ Login success: ${user.userId} (${user.role})`);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                userId: user.userId, name: user.name, email: user.email,
                role: user.role, department: user.department, floor: user.floor,
            },
        });
    } catch (error) {
        console.error('❌ Login error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    console.log(`👤 Get profile: ${req.user.userId}`);
    res.json({ success: true, user: req.user });
};

// POST /api/auth/logout
const logout = async (req, res) => {
    console.log(`🚪 Logout: ${req.user.userId}`);
    res.json({ success: true, message: 'Logged out' });
};

module.exports = { register, login, getMe, logout };
