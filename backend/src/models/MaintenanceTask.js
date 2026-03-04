const mongoose = require('mongoose');

const maintenanceTaskSchema = new mongoose.Schema({
    taskId: { type: String, unique: true }, // MT-XXXX — auto-generated
    title: { type: String, required: true },
    description: { type: String, default: '' },
    location: { type: String, required: true },
    issueType: {
        type: String,
        enum: ['electrical', 'plumbing', 'hvac', 'lighting', 'parking_sensor', 'elevator', 'general'],
        default: 'general',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
    },
    status: {
        type: String,
        enum: ['assigned', 'in_progress', 'completed', 'cancelled'],
        default: 'assigned',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledFor: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    notes: { type: String, default: '' },
}, { timestamps: true });

maintenanceTaskSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model('MaintenanceTask').countDocuments();
        this.taskId = `MT-${String(count + 1).padStart(4, '0')}`;
        console.log(`🔧 New maintenance task: ${this.taskId} [${this.issueType}] priority:${this.priority}`);
    }
    if (this.isModified('status') && this.status === 'completed') {
        this.completedAt = new Date();
        console.log(`✅ Maintenance task ${this.taskId} completed`);
    }
    next();
});

module.exports = mongoose.model('MaintenanceTask', maintenanceTaskSchema);
