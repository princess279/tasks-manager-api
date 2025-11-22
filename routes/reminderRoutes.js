// routes/reminderRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { reminderJob, scheduleReminderJob } from '../jobs/reminderJob.js';

const router = express.Router();

// Schedule the cron job when the server starts
scheduleReminderJob();

/**
 * @route   POST /api/reminders/trigger
 * @desc    Manually trigger due date reminders (for testing)
 * @access  Private
 */
router.post('/trigger', protect, async (req, res) => {
  try {
    await reminderJob(); // manually run reminder logic
    return res.status(200).json({ message: 'Reminders triggered successfully' });
  } catch (err) {
    console.error('Error triggering reminders:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;