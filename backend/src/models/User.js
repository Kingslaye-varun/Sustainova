const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true }, // SN-2026-XXXXX — auto-generated
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
        type: String,
        enum: ['employee', 'admin', 'maintenance', 'visitor'],
        default: 'employee',
    },
    department: { type: String, default: 'General' },
    floor: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: '' }, // initials or URL
    lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

// Auto-generate unique User ID before save
userSchema.pre('save', async function () {
    if (this.isNew) {
        const count = await mongoose.model('User').countDocuments();
        this.userId = `SN-2026-${String(count + 1).padStart(5, '0')}`;
        console.log(`🆔 Generated User ID: ${this.userId}`);
    }
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log(`🔒 Password hashed for user: ${this.email}`);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
