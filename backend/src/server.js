require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const app = express();

// ── Connect DB ──
connectDB();

// ── Middleware ──
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // HTTP request logging

// ── Health check ──
app.get('/api/health', (req, res) => {
    console.log('💚 Health check ping');
    res.json({
        success: true,
        message: 'SUSTAINOVA API is running 🏢',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// ── Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/parking', require('./routes/parking'));
app.use('/api/gym', require('./routes/gym'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/announcements', require('./routes/announcements'));

// ── 404 handler ──
app.use((req, res) => {
    console.warn(`⚠️  404 — ${req.method} ${req.originalUrl}`);
    res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// ── Global error handler ──
app.use((err, req, res, next) => {
    console.error('💥 Unhandled error:', err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

// ── Start server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════╗');
    console.log('  ║   SUSTAINOVA BACKEND — v1.0.0        ║');
    console.log('  ╠══════════════════════════════════════╣');
    console.log(`  ║   🚀 Server   : http://localhost:${PORT}  ║`);
    console.log(`  ║   🌍 Env      : ${process.env.NODE_ENV}            ║`);
    console.log('  ╚══════════════════════════════════════╝');
    console.log('');
});

module.exports = app;
