const mongoose = require('mongoose');

/* ─── Visitor Gate Pass ─────────────────────────────────── */
const visitorGatePassSchema = new mongoose.Schema({
    passCode: { type: String, unique: true }, // VSGP-XXXXXX — auto generated
    visitorName:  { type: String, required: true, trim: true },
    email:        { type: String, required: true, lowercase: true, trim: true },
    phone:        { type: String, default: '' },
    company:      { type: String, default: '' },       // visitor's company
    purpose:      { type: String, required: true },     // reason for visit
    hostEmployee: { type: String, required: true },     // name of host
    hostEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorizedFloors: { type: [String], default: ['Lobby', 'Meeting Rooms'] },
    validFrom:    { type: Date, required: true },
    validTo:      { type: Date, required: true },
    qrCodeUrl:    { type: String, default: '' },        // Cloudinary URL for QR image
    qrData:       { type: String, default: '' },        // JSON string encoded in QR
    status: {
        type: String,
        enum: ['active', 'expired', 'revoked', 'used'],
        default: 'active',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emailSent:  { type: Boolean, default: false },
    entryLog:   [{ scannedAt: Date, location: String }],
}, { timestamps: true });

/* ─── Staff (Maintenance) Gate Pass ─────────────────────── */
const staffGatePassSchema = new mongoose.Schema({
    passCode:   { type: String, unique: true }, // STGP-XXXXXX — auto generated
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    photoUrl:   { type: String, default: '' },   // Cloudinary photo URL
    photoPublicId: { type: String, default: '' }, // Cloudinary public_id for deletion
    qrCodeUrl:  { type: String, default: '' },
    qrData:     { type: String, default: '' },
    issuedDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },                  // defaults to 1 year from issue
    isActive:   { type: Boolean, default: true },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const VisitorGatePass = mongoose.model('VisitorGatePass', visitorGatePassSchema);
const StaffGatePass   = mongoose.model('StaffGatePass',   staffGatePassSchema);

module.exports = { VisitorGatePass, StaffGatePass };
