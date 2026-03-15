/**
 * SUSTAINOVA — Database Seed Script
 * Creates test admin, maintenance staff + gate pass, and test visitor gate pass.
 *
 * Run from /backend directory:
 *   node src/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const crypto   = require('crypto');

const genCode    = (prefix) => `${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
const nextYear   = ()       => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
const inThreeHrs = ()       => new Date(Date.now() +   3 * 60 * 60 * 1000);

async function seed() {
    /* ─ Connect ─────────────────────────────────────── */
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`\n✅ MongoDB Connected: ${mongoose.connection.host}`);
    console.log('🌱 SUSTAINOVA Seed Script Starting…\n');

    /* lazy-require models AFTER connecting */
    const User = require('./models/User');
    const { VisitorGatePass, StaffGatePass } = require('./models/GatePass');

    /* ─ 1. Admin ────────────────────────────────────── */
    let admin = await User.findOne({ email: 'admin@sustainova.in' });
    if (!admin) {
        admin = await User.create({
            name: 'Building Admin', email: 'admin@sustainova.in',
            password: 'Admin@2026', role: 'admin',
            department: 'Administration', floor: 1,
        });
        console.log(`✅ Admin       → ${admin.userId} | admin@sustainova.in | Admin@2026`);
    } else {
        console.log(`ℹ️  Admin exists → ${admin.userId}`);
    }

    /* ─ 2. Employee ─────────────────────────────────── */
    let employee = await User.findOne({ email: 'varun@sustainova.in' });
    if (!employee) {
        employee = await User.create({
            name: 'Varun Rahatgaonkar', email: 'varun@sustainova.in',
            password: 'Employee@2026', role: 'employee',
            department: 'IT Engineering', floor: 12,
        });
        console.log(`✅ Employee    → ${employee.userId} | varun@sustainova.in | Employee@2026`);
    } else {
        console.log(`ℹ️  Employee exists → ${employee.userId}`);
    }

    /* ─ 3. Maintenance ──────────────────────────────── */
    let maint = await User.findOne({ email: 'raju@sustainova.in' });
    if (!maint) {
        maint = await User.create({
            name: 'Raju Kumar', email: 'raju@sustainova.in',
            password: 'Maintain@2026', role: 'maintenance',
            department: 'HVAC & Electricals', floor: 6,
        });
        console.log(`✅ Maintenance → ${maint.userId} | raju@sustainova.in | Maintain@2026`);
    } else {
        console.log(`ℹ️  Maintenance exists → ${maint.userId}`);
    }

    /* ─ 4. Staff Gate Pass ──────────────────────────── */
    let staffPass = await StaffGatePass.findOne({ userId: maint._id });
    if (!staffPass) {
        const passCode = genCode('STGP');
        staffPass = await StaffGatePass.create({
            userId: maint._id, passCode,
            photoUrl: '', qrCodeUrl: '',
            qrData: JSON.stringify({ type: 'staff', passCode, userId: maint.userId, name: maint.name }),
            issuedDate: new Date(), expiryDate: nextYear(),
            isActive: true, createdBy: admin._id,
        });
        console.log(`✅ Staff Pass  → ${passCode}`);
        console.log(`   🌐 http://localhost:5173/gate-pass/${passCode}`);
    } else {
        console.log(`ℹ️  Staff Pass exists → ${staffPass.passCode}`);
        console.log(`   🌐 http://localhost:5173/gate-pass/${staffPass.passCode}`);
    }

    /* ─ 5. Visitor Gate Pass ────────────────────────── */
    let visPass = await VisitorGatePass.findOne({ email: 'testvisitor@example.com', status: 'active' });
    if (!visPass) {
        const passCode = genCode('VSGP');
        visPass = await VisitorGatePass.create({
            passCode,
            visitorName: 'Aditya Shah', email: 'testvisitor@example.com',
            phone: '+91 98765 43210', company: 'Infosys Ltd.',
            purpose: 'Client Demo & Product Meeting',
            hostEmployee: 'Varun Rahatgaonkar', hostEmployeeId: employee._id,
            authorizedFloors: ['Lobby', 'Floor 12', 'Meeting Room B'],
            validFrom: new Date(), validTo: inThreeHrs(),
            qrCodeUrl: '', qrData: JSON.stringify({ type: 'visitor', passCode }),
            status: 'active', createdBy: admin._id,
        });
        console.log(`✅ Visitor Pass → ${passCode}`);
        console.log(`   🌐 http://localhost:5173/gate-pass/${passCode}`);
    } else {
        console.log(`ℹ️  Visitor Pass exists → ${visPass.passCode}`);
        console.log(`   🌐 http://localhost:5173/gate-pass/${visPass.passCode}`);
    }

    /* ─ Summary ─────────────────────────────────────── */
    console.log('\n──────────────────────────────────────────────────────');
    console.log('🎉 Seed complete! Test credentials:');
    console.log('──────────────────────────────────────────────────────');
    console.log('  👑 Admin        admin@sustainova.in    / Admin@2026');
    console.log('  👤 Employee     varun@sustainova.in    / Employee@2026');
    console.log('  🔧 Maintenance  raju@sustainova.in     / Maintain@2026');
    console.log('──────────────────────────────────────────────────────\n');
}

seed()
    .then(() => mongoose.connection.close())
    .catch(err => { console.error('❌ Seed error:', err.message); process.exit(1); });
