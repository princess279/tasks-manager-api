import nodemailer from 'nodemailer';

// Use default 587 if port is missing
const EMAIL_PORT = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587;
const SECURE = EMAIL_PORT === 465;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,      // e.g., smtp.gmail.com
  port: EMAIL_PORT,                   // 587 for TLS, 465 for SSL
  secure: SECURE,                     // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,       // allows self-signed / cloud connections
  },
  connectionTimeout: 10000,           // 10 seconds timeout
});

// Verify transporter at startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter configuration error:', error.message);
  } else {
    console.log('Email transporter is ready.');
  }
});

const sendEmail = async (to, subject, html) => {
  if (!to) return;

  const mail = {
    from: `"Task Manager" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mail);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`Failed to send email to ${to}: ${err.message}`);
    return null; // prevents job from crashing
  }
};

export default sendEmail;