// jobs/reminderJob.js
import cron from 'node-cron';
import Task from '../models/Task.js';
import sendEmail from '../utils/email.js';
import { DateTime } from 'luxon';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Reminder job: send email for tasks due today
 * In production: only at 8 AM user timezone
 * In development: sends immediately for testing
 */
export const reminderJob = async () => {
  try {
    console.log('Running task reminder job...');

    // Find pending tasks that haven't been reminded yet
    const tasks = await Task.find({ status: 'pending', reminderSent: { $ne: true } })
      .populate('user', 'email name timezone');

    if (!tasks.length) return console.log('No pending tasks found.');

    for (const task of tasks) {
      const user = task.user;
      if (!user || !user.email) continue;

      const userTz = user.timezone || 'UTC';
      const nowInUserTz = DateTime.now().setZone(userTz);
      const currentHour = nowInUserTz.hour;

      // Only send reminder at 8 AM in production
      if (isProduction && currentHour !== 8) continue;

      const taskDueInUserTz = DateTime.fromJSDate(task.dueDate).setZone(userTz).startOf('day');

      // Skip if task is not due today
      if (!taskDueInUserTz.equals(nowInUserTz.startOf('day'))) continue;

      console.log(`Sending reminder for task "${task.title}" to ${user.email}`);

      try {
        await sendEmail(
          user.email,
          `Reminder: "${task.title}" is due today`,
          `Hi ${user.name || 'there'},<br>Your task "<b>${task.title}</b>" is due today.<br>— Task Manager Team`
        );

        task.reminderSent = true;
        await task.save();
        console.log(`Reminder sent successfully for "${task.title}"`);
      } catch (emailErr) {
        console.error(`Failed to send email for "${task.title}":, emailErr.message`);
      }
    }
  } catch (err) {
    console.error('Error running reminder job:', err.message);
  }
};

/**
 * Schedule cron job
 * In production: runs every day at 8 AM UTC
 * In development: runs every 30 seconds for testing
 */
export const scheduleReminderJob = () => {
  const schedule = isProduction ? '0 8 * * *' : '*/30 * * * * *';
  try {
    cron.schedule(schedule, reminderJob, { scheduled: true, timezone: 'UTC' });
    console.log(`Reminder job scheduled with cron: "${schedule}"`);
  } catch (cronErr) {
    console.error('Failed to schedule reminder job:', cronErr.message);
  }
};

export default reminderJob;