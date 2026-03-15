const transporter = require('../config/mailer');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/* ─── Visitor Gate Pass Email ────────────────────────────── */
const sendVisitorGatePass = async ({ visitorName, email, passCode, purpose, hostEmployee, validFrom, validTo, authorizedFloors, qrCodeUrl }) => {
    const validFromStr = new Date(validFrom).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const validToStr   = new Date(validTo).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const floorsStr    = Array.isArray(authorizedFloors) ? authorizedFloors.join(', ') : authorizedFloors;
    const passUrl      = `${CLIENT_URL}/gate-pass/${passCode}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SUSTAINOVA Gate Pass</title>
</head>
<body style="margin:0;padding:0;background:#F2F5F9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F5F9;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0A1628,#132845);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
            <p style="margin:0 0 8px;font-size:28px;">🏢</p>
            <h1 style="margin:0;color:#00C9B1;font-size:24px;font-weight:700;letter-spacing:2px;">SUSTAINOVA</h1>
            <p style="margin:6px 0 0;color:#8BA3B8;font-size:13px;">Smart Office Building · Ghansoli, Navi Mumbai</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#FFFFFF;padding:32px;border-left:1px solid #E4EBF2;border-right:1px solid #E4EBF2;">
            <h2 style="margin:0 0 6px;color:#0F1C2E;font-size:20px;">🪪 Visitor Gate Pass</h2>
            <p style="margin:0 0 24px;color:#4A6580;font-size:14px;">Hello <strong>${visitorName}</strong>, your entry pass is ready.</p>

            <!-- Pass details -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7FAFD;border-radius:12px;border:1px solid #E4EBF2;overflow:hidden;margin-bottom:24px;">
              ${[
                ['🆔 Pass Code',  `<strong style="color:#007A6E;letter-spacing:1px;">${passCode}</strong>`],
                ['📋 Purpose',    purpose],
                ['👤 Host',       hostEmployee],
                ['🗓️ Valid From', validFromStr],
                ['⏰ Valid Until', validToStr],
                ['🏢 Floors',     floorsStr],
              ].map(([label, value], i) => `
              <tr style="border-top:${i === 0 ? 'none' : '1px solid #E4EBF2'}">
                <td style="padding:12px 16px;color:#4A6580;font-size:13px;width:40%;">${label}</td>
                <td style="padding:12px 16px;color:#0F1C2E;font-size:14px;font-weight:500;">${value}</td>
              </tr>`).join('')}
            </table>

            <!-- QR Code -->
            <div style="text-align:center;margin-bottom:24px;">
              <p style="margin:0 0 12px;color:#4A6580;font-size:13px;">Scan this QR code at the building entrance:</p>
              <img src="${qrCodeUrl}" alt="Gate Pass QR Code" width="180" height="180"
                   style="border-radius:12px;border:4px solid #E4EBF2;display:block;margin:0 auto;" />
            </div>

            <!-- CTA Button -->
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${passUrl}" style="display:inline-block;background:#007A6E;color:#FFFFFF;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;">
                📱 View Digital Gate Pass
              </a>
            </div>

            <p style="margin:0;color:#8A9BAD;font-size:12px;text-align:center;line-height:1.6;">
              This pass is non-transferable and expires at the time shown above.<br>
              For assistance, contact reception at Ext. 100 or visit the security desk.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0A1628;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#4A6580;font-size:12px;">
              SUSTAINOVA · Solar Decathlon India 2026 · TATA Realty<br>
              VESCOA Architecture + VESIT IT
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
        from: `"SUSTAINOVA Building" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: `🏢 SUSTAINOVA Gate Pass — ${visitorName} | ${passCode}`,
        html,
    });

    console.log(`📧 Visitor gate pass emailed to: ${email}`);
};

/* ─── Maintenance Staff Welcome Email ────────────────────── */
const sendStaffWelcome = async ({ name, email, userId, tempPassword, qrCodeUrl, passCode }) => {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Welcome — SUSTAINOVA</title></head>
<body style="margin:0;padding:0;background:#F2F5F9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F5F9;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <tr>
          <td style="background:linear-gradient(135deg,#0A1628,#132845);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
            <p style="margin:0 0 8px;font-size:28px;">🔧</p>
            <h1 style="margin:0;color:#00C9B1;font-size:24px;font-weight:700;letter-spacing:2px;">SUSTAINOVA</h1>
            <p style="margin:6px 0 0;color:#8BA3B8;font-size:13px;">Maintenance Staff Welcome Kit</p>
          </td>
        </tr>

        <tr>
          <td style="background:#FFFFFF;padding:32px;border-left:1px solid #E4EBF2;border-right:1px solid #E4EBF2;">
            <h2 style="margin:0 0 6px;color:#0F1C2E;font-size:20px;">Welcome, ${name}! 👋</h2>
            <p style="margin:0 0 24px;color:#4A6580;font-size:14px;">Your SUSTAINOVA staff account has been created by the building administrator.</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7FAFD;border-radius:12px;border:1px solid #E4EBF2;overflow:hidden;margin-bottom:24px;">
              ${[
                ['🆔 Staff ID',           `<strong style="color:#007A6E;">${userId}</strong>`],
                ['📧 Email',              email],
                ['🔑 Temporary Password', `<code style="background:#E4EBF2;padding:2px 8px;border-radius:4px;font-size:13px;">${tempPassword}</code>`],
              ].map(([label, value], i) => `
              <tr style="border-top:${i === 0 ? 'none' : '1px solid #E4EBF2'}">
                <td style="padding:12px 16px;color:#4A6580;font-size:13px;width:40%;">${label}</td>
                <td style="padding:12px 16px;color:#0F1C2E;font-size:14px;">${value}</td>
              </tr>`).join('')}
            </table>

            <div style="text-align:center;margin-bottom:24px;">
              <p style="margin:0 0 12px;color:#4A6580;font-size:13px;">Your gate pass QR code (scan at building entrance):</p>
              <img src="${qrCodeUrl}" alt="Staff Gate Pass QR" width="160" height="160"
                   style="border-radius:12px;border:4px solid #E4EBF2;display:block;margin:0 auto;" />
              <p style="margin:8px 0 0;color:#8A9BAD;font-size:11px;">${passCode}</p>
            </div>

            <div style="background:#FFF8E1;border:1px solid #F5B800;border-radius:10px;padding:14px;margin-bottom:16px;">
              <p style="margin:0;color:#0F1C2E;font-size:13px;">⚠️ <strong>Please change your password</strong> after your first login at <a href="${process.env.CLIENT_URL}" style="color:#007A6E;">${process.env.CLIENT_URL}</a></p>
            </div>

            <p style="margin:0;color:#8A9BAD;font-size:12px;text-align:center;">
              If you have questions, contact your building administrator or call reception Ext. 100.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#0A1628;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#4A6580;font-size:12px;">SUSTAINOVA · Solar Decathlon India 2026 · TATA Realty</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
        from: `"SUSTAINOVA Building" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: `🔧 Welcome to SUSTAINOVA — Your Staff Account is Ready`,
        html,
    });

    console.log(`📧 Staff welcome email sent to: ${email}`);
};

module.exports = { sendVisitorGatePass, sendStaffWelcome };
