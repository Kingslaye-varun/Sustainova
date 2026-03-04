const MaintenanceTask = require('../models/MaintenanceTask');

// GET /api/maintenance — all tasks or assigned to me
const getTasks = async (req, res) => {
    try {
        const { status, priority } = req.query;
        const filter = {};
        if (req.user.role === 'maintenance') filter.assignedTo = req.user._id;
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const tasks = await MaintenanceTask.find(filter)
            .populate('assignedTo', 'name userId')
            .populate('reportedBy', 'name userId department')
            .sort({ createdAt: -1 });

        console.log(`🔧 Tasks fetched for ${req.user.userId}: ${tasks.length} tasks`);
        res.json({ success: true, count: tasks.length, tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/maintenance
const createTask = async (req, res) => {
    try {
        const { title, description, location, issueType, priority, assignedTo, scheduledFor } = req.body;
        console.log(`📝 New maintenance task by ${req.user.userId}: [${issueType}] ${title}`);

        const task = await MaintenanceTask.create({
            title, description, location, issueType, priority,
            assignedTo: assignedTo || null,
            scheduledFor: scheduledFor || null,
            reportedBy: req.user._id,
        });

        const populated = await task.populate('assignedTo', 'name userId');
        res.status(201).json({ success: true, message: 'Task created', task: populated });
    } catch (error) {
        console.error('❌ Create task error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/maintenance/:id
const updateTask = async (req, res) => {
    try {
        const { status, notes, assignedTo } = req.body;
        const task = await MaintenanceTask.findById(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        if (status) task.status = status;
        if (notes) task.notes = notes;
        if (assignedTo) task.assignedTo = assignedTo;
        await task.save();

        console.log(`✏️  Task ${task.taskId} → status: ${task.status}`);
        await task.populate('assignedTo', 'name userId');
        await task.populate('reportedBy', 'name userId');
        res.json({ success: true, message: 'Task updated', task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getTasks, createTask, updateTask };
