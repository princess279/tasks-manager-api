import sgMail from '@sendgrid/mail';

// Load SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send an email using SendGrid API
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of email
 */
const sendEmail = async (to, subject, html) => {
  try {
    // Validation
    if (!process.env.SENDGRID_API_KEY) {
      console.error("❌ Missing SENDGRID_API_KEY in environment variables.");
      return;
    }

    if (!process.env.EMAIL_FROM) {
      console.error("❌ Missing EMAIL_FROM (must be a verified sender in SendGrid).");
      return;
    }

    if (!to) {
      console.error("❌ No recipient email provided. Aborting send.");
      return;
    }

    const msg = {
      to,
      from: process.env.EMAIL_FROM,
      subject,
      html,
    };

    const response = await sgMail.send(msg);
    console.log(`📧 Email successfully sent to ${to}`);
    return response;

  } catch (error) {
    console.error("❌ SendGrid Error:");
    console.error(error.response?.body || error.message);
    return null;
  }
};

export default sendEmail;