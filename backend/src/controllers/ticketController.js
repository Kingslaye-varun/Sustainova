const Ticket = require('../models/Ticket');

// GET /api/tickets — all tickets (admin) or own tickets (employee)
const getTickets = async (req, res) => {
    try {
        const { status, category, priority } = req.query;
        const filter = {};

        if (req.user.role !== 'admin' && req.user.role !== 'maintenance') {
            filter.raisedBy = req.user._id; // employees see only their own
        }
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;

        const tickets = await Ticket.find(filter)
            .populate('raisedBy', 'name userId department')
            .populate('assignedTo', 'name userId')
            .sort({ createdAt: -1 });

        console.log(`🎫 ${req.user.userId} fetched ${tickets.length} tickets`);
        res.json({ success: true, count: tickets.length, tickets });
    } catch (error) {
        console.error('❌ Get tickets error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/tickets
const createTicket = async (req, res) => {
    try {
        const { title, description, category, priority, location } = req.body;
        console.log(`📝 New ticket from ${req.user.userId}: [${category}] ${title}`);

        const ticket = await Ticket.create({
            title, description, category, priority, location,
            raisedBy: req.user._id,
        });

        const populated = await ticket.populate('raisedBy', 'name userId');
        res.status(201).json({ success: true, message: 'Ticket created', ticket: populated });
    } catch (error) {
        console.error('❌ Create ticket error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/tickets/:id — update status / assign
const updateTicket = async (req, res) => {
    try {
        const { status, assignedTo, notes, rating } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

        if (status) ticket.status = status;
        if (assignedTo) ticket.assignedTo = assignedTo;
        if (notes) ticket.notes = notes;
        if (rating) ticket.rating = rating;

        await ticket.save();
        await ticket.populate('raisedBy', 'name userId');
        await ticket.populate('assignedTo', 'name userId');

        console.log(`✏️  Ticket ${ticket.ticketId} updated → status: ${ticket.status}`);
        res.json({ success: true, message: 'Ticket updated', ticket });
    } catch (error) {
        console.error('❌ Update ticket error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/tickets/stats — admin only
const getStats = async (req, res) => {
    try {
        const [total, open, inProgress, resolved] = await Promise.all([
            Ticket.countDocuments(),
            Ticket.countDocuments({ status: 'open' }),
            Ticket.countDocuments({ status: 'in_progress' }),
            Ticket.countDocuments({ status: 'resolved' }),
        ]);
        const byCategory = await Ticket.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
        ]);
        console.log(`📊 Ticket stats: total=${total} open=${open} inProgress=${inProgress}`);
        res.json({ success: true, stats: { total, open, inProgress, resolved, byCategory } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getTickets, createTicket, updateTicket, getStats };
