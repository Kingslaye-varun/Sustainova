const User = require('../models/User');

// GET /api/users — admin only
const getAllUsers = async (req, res) => {
    try {
        console.log(`📋 Admin ${req.user.userId} fetching all users`);
        const { role, search } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (search) filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { userId: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];

        const users = await User.find(filter).sort({ createdAt: -1 });
        console.log(`📊 Found ${users.length} users`);
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        console.error('❌ Get users error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/users/:id — admin or self
const updateUser = async (req, res) => {
    try {
        const { name, department, floor, role, isActive } = req.body;
        const isAdmin = req.user.role === 'admin';
        const isSelf = req.user._id.toString() === req.params.id;

        if (!isAdmin && !isSelf) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this user' });
        }

        const updates = { name, department, floor };
        if (isAdmin) { updates.role = role; updates.isActive = isActive; }

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        console.log(`✏️  User updated: ${user.userId} by admin ${req.user.userId}`);
        res.json({ success: true, message: 'User updated', user });
    } catch (error) {
        console.error('❌ Update user error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/users/:id — admin only
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        console.log(`🗑️  User deactivated: ${user.userId} by admin ${req.user.userId}`);
        res.json({ success: true, message: 'User deactivated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
