const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify connection on startup (non-fatal)
transporter.verify((err) => {
    if (err) console.warn('⚠️ Mailer not connected:', err.message);
    else console.log('📧 Mailer ready');
});

module.exports = transporter;
