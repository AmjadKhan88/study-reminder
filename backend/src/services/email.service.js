const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function sendPasswordResetEmail(toEmail, name, code) {
  const fromName = process.env.EMAIL_FROM_NAME || 'StudyPilot';

  await transporter.sendMail({
    from: `"${fromName}" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${code} is your StudyPilot reset code`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <div style="background: #4A47A3; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="color: #fff; font-size: 20px; font-weight: 700;">📚 StudyPilot</span>
        </div>
        <p style="color: #12131A; font-size: 16px;">Hi ${name},</p>
        <p style="color: #4B4B57; font-size: 15px; line-height: 1.5;">
          Use this code to reset your password. It expires in 15 minutes.
        </p>
        <div style="background: #F7F7F9; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4A47A3;">${code}</span>
        </div>
        <p style="color: #9C9CA8; font-size: 13px;">
          If you didn't request this, you can safely ignore this email — your password won't be changed.
        </p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };