import express from 'express';
import sendEmail from '../utils/email.js';

const router = express.Router();

// Test email route — no login required
router.get('/send-test-email', async (req, res) => {
  try {
    await sendEmail(
      'ogabuprecious5@gmail.com', // replace with your email
      'Test Email from Task Manager API',
      '<p>This is a test email from your Task Manager API project.</p>'
    );

    res.status(200).json({ message: 'Test email sent successfully!' });
  } catch (err) {
    console.error('Failed to send test email:', err);
    res.status(500).json({ message: 'Failed to send test email', error: err.message });
  }
});

export default router;