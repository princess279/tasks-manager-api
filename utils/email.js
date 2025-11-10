import nodemailer from 'nodemailer';

// Set up email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,            // e.g., smtp.gmail.com
  port: process.env.EMAIL_PORT || 587,     // default to 587 if not set
  secure: process.env.EMAIL_PORT == 465,   // true for 465, false for others
  auth: {
    user: process.env.EMAIL_USER,          // your email
    pass: process.env.EMAIL_PASS,          // your password or app password
  },
});

// Verify transporter configuration at startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter configuration error:', error.message);
  } else {
    console.log('Email transporter is configured and ready.');
  }
});

/**
 * Send an email
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - email body in HTML
 */
const sendEmail = async (to, subject, html) => {
  if (!to) {
    console.log('No recipient email provided. Skipping...');
    return;
  }

  const mail = {
    from: `"Task Manager" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mail);
    console.log(`Email sent to ${to}`);
    return info;
  } catch (err) {
    console.log(`Could not send email to ${to}: ${err.message}`);
    return null; // don’t throw error, so job keeps running
  }
};

export default sendEmail;