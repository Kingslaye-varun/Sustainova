const QRCode = require('qrcode');
const cloudinary = require('../config/cloudinary');

/**
 * Generate a QR code, upload to Cloudinary, return the secure URL.
 * @param {Object} data  — JSON object to encode
 * @param {string} folder — Cloudinary folder (e.g. 'gate-passes/visitors')
 * @returns {{ qrCodeUrl: string, qrData: string }}
 */
const generateAndUploadQR = async (data, folder = 'gate-passes') => {
    const qrData = JSON.stringify(data);

    // Generate QR as base64 PNG
    const qrBase64 = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        width: 400,
        margin: 2,
        color: {
            dark: '#0A1628',
            light: '#F0F4F8',
        },
    });

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(qrBase64, {
        folder,
        resource_type: 'image',
        overwrite: true,
        quality: 'auto',
    });

    return {
        qrCodeUrl: uploadResult.secure_url,
        qrData,
    };
};

module.exports = { generateAndUploadQR };
