const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketId: { type: String, unique: true }, // TK-XXXX — auto-generated
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['facilities', 'it', 'health', 'parking', 'general'],
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open',
    },
    location: { type: String, default: '' },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },
    rating: { type: Number, min: 1, max: 5, default: null },
}, { timestamps: true });

ticketSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model('Ticket').countDocuments();
        this.ticketId = `TK-${String(count + 1).padStart(4, '0')}`;
        console.log(`🎫 New ticket created: ${this.ticketId} [${this.category}]`);
    }
    if (this.isModified('status') && this.status === 'resolved') {
        this.resolvedAt = new Date();
        console.log(`✅ Ticket ${this.ticketId} resolved`);
    }
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
