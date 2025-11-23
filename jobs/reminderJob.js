// ReminderJob.js
import cron from 'node-cron';
import { DateTime } from 'luxon';
import Task from '../models/Task.js';
import sendEmail from '../utils/email.js';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Archive past-due tasks automatically
 */
export const archivePastTasks = async () => {
  try {
    const today = DateTime.now().startOf('day').toJSDate();

    const result = await Task.updateMany(
      { dueDate: { $lt: today }, status: 'pending' },
      { $set: { status: 'archived' } }
    );

    console.log(`Archived ${result.modifiedCount} past-due tasks`);
  } catch (err) {
    console.error('Error archiving past tasks:', err.message);
  }
};

/**
 * Reminder job: send email for tasks due today
 */
export const reminderJob = async () => {
  try {
    console.log('Running task reminder job...');

    await archivePastTasks();

    const tasks = await Task.find({
      status: 'pending',
      reminderSent: { $ne: true },
    }).populate('user', 'email name timezone');

    if (!tasks.length) return console.log('No pending tasks.');

    for (const task of tasks) {
      const user = task.user;
      if (!user || !user.email) continue;

      const userTz = user.timezone || 'UTC';
      const now = DateTime.now().setZone(userTz);

      // If user set a reminder time — only trigger at that exact minute
      if (task.reminderTime) {
        const [h, m] = task.reminderTime.split(':');
        if (now.hour !== Number(h) || now.minute !== Number(m)) continue;
      } else {
        // No reminder time → use default 8AM in production
        if (isProduction && now.hour !== 8) continue;
      }

      // Ensure due date is today
      const due = DateTime.fromJSDate(task.dueDate).setZone(userTz);
      if (!due.hasSame(now, 'day')) continue;

      // Send reminder
      await sendEmail(
        user.email,
        `Reminder: "${task.title}" is due today`,
        `Hi ${user.name || 'there'},<br>Your task "<b>${task.title}</b>" is due today.<br>— Task Manager`
      );

      task.reminderSent = true;
      await task.save();
      console.log(`Reminder sent for ${task.title}`);
    }
  } catch (err) {
    console.error('Error running reminder job:', err.message);
  }
};

/**
 * Schedule cron job
 * Production: 8 AM daily, Dev: every 30 seconds for testing
 */
export const scheduleReminderJob = () => {
  const schedule = isProduction ? '0 8 * * *' : '*/30 * * * * *';
  try {
    cron.schedule(schedule, reminderJob, { scheduled: true, timezone: 'UTC' });
    console.log(`Reminder job scheduled: "${schedule}"`);
  } catch (cronErr) {
    console.error('Failed to schedule reminder job:', cronErr.message);
  }
};

export default reminderJob;