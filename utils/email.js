import sgMail from '@sendgrid/mail';

// Set API key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send an email using SendGrid API
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - email body in HTML
 */
const sendEmail = async (to, subject, html) => {
  if (!to) {
    console.log("No email provided. Skipping email sending...");
    return;
  }

  const msg = {
    to,
    from: process.env.EMAIL_FROM, // MUST be a verified sender
    subject,
    html,
  };

  try {
    const response = await sgMail.send(msg);
    console.log(`Email sent successfully to: ${to}`);
    return response;
  } catch (error) {
    console.error("SendGrid Error:", error.response?.body || error.message);
    return null; 
  }
};

export default sendEmail;