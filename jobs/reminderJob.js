import cron from 'node-cron';
import Task from '../models/Task.js';
import sendEmail from '../utils/email.js';
import { DateTime } from 'luxon';

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

    // Archive past tasks first
    await archivePastTasks();

    // Find pending tasks due today that haven't been reminded yet
    const tasks = await Task.find({ status: 'pending', reminderSent: { $ne: true } })
      .populate('user', 'email name timezone');

    if (!tasks.length) return console.log('No pending tasks for today.');

    for (const task of tasks) {
      const user = task.user;
      if (!user || !user.email) continue;

      const userTz = user.timezone || 'UTC';
      const nowInUserTz = DateTime.now().setZone(userTz);
      const currentHour = nowInUserTz.hour;

      if (isProduction && currentHour !== 8) continue; // only 8 AM in prod

      const taskDueInUserTz = DateTime.fromJSDate(task.dueDate).setZone(userTz).startOf('day');
      if (!taskDueInUserTz.equals(nowInUserTz.startOf('day'))) continue;

      try {
        await sendEmail(
          user.email,
          `Reminder: "${task.title}" is due today`,
          `Hi ${user.name || 'there'},<br>Your task "<b>${task.title}</b>" is due today.<br>— Task Manager Team`
        );

        task.reminderSent = true;
        await task.save();
        console.log(`Reminder sent for "${task.title}"`);
      } catch (emailErr) {
        console.error(`Failed to send email for "${task.title}": ${emailErr.message}`);
      }
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