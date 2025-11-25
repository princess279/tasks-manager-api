// ReminderJob.js
import cron from 'node-cron';
import { DateTime } from 'luxon';
import Task from '../models/Task.js';
import User from '../models/User.js';
import sendEmail from '../utils/email.js';

const isProduction = process.env.NODE_ENV === 'production';

// ------------------ ARCHIVE PAST TASKS ------------------
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

// ------------------ REMINDER JOB ------------------
export const reminderJob = async () => {
  try {
    console.log('Running task reminder job...');

    await archivePastTasks();

    const nowUTC = DateTime.now().setZone('UTC');

    // ------------------ TASK REMINDERS ------------------
    const tasks = await Task.find({
      status: 'pending',
      reminderSent: { $ne: true },
    }).populate('user', 'email name timezone');

    for (const task of tasks) {
      const user = task.user;
      if (!user || !user.email) continue;

      const userTz = user.timezone || 'UTC';
      const now = nowUTC.setZone(userTz);
      const due = DateTime.fromJSDate(task.dueDate).setZone(userTz);

      // Only send if due today
      if (!due.hasSame(now, 'day')) continue;

      let shouldSend = false;

      if (task.reminderTime) {
        const [h, m] = task.reminderTime.split(':');

        // ±1 minute buffer
        const taskReminderTime = now.set({
          hour: Number(h),
          minute: Number(m),
          second: 0,
          millisecond: 0,
        });

        const diffMinutes = Math.abs(now.diff(taskReminderTime, 'minutes').minutes);

        if (diffMinutes <= 1) shouldSend = true;

      } else {
        // Default 8 AM if no reminder time (PRODUCTION ONLY)
        if (isProduction && now.hour === 8 && now.minute <= 1) {
          shouldSend = true;
        }
      }

      if (shouldSend) {
        await sendEmail(
          user.email,
          `Reminder: "${task.title}" is due today`,
          `Hi ${user.name || 'there'},<br>Your task "<b>${task.title}</b>" is due today.<br>— Task Manager`
        );

        task.reminderSent = true;
        await task.save();
        console.log(`Task reminder sent for ${task.title}`);
      }
    }

    // ------------------ DAILY USER REMINDERS ------------------
    const users = await User.find({
      dailyReminder: true,
      reminderTime: { $exists: true, $ne: null },
    });

    for (const user of users) {
      const userTz = user.timezone || 'UTC';
      const now = nowUTC.setZone(userTz);
      const [h, m] = user.reminderTime.split(':');

      const dailyReminderTime = now.set({
        hour: Number(h),
        minute: Number(m),
        second: 0,
        millisecond: 0,
      });

      const diffMinutes = Math.abs(now.diff(dailyReminderTime, 'minutes').minutes);

      if (diffMinutes <= 1) {
        await sendEmail(
          user.email,
          'Daily Reminder',
          `Hi ${user.name || 'there'},<br>This is your daily reminder from Task Manager.<br>— Task Manager`
        );
        console.log(`Daily reminder sent to ${user.email}`);
      }
    }
  } catch (err) {
    console.error('Error running reminder job:', err.message);
  }
};

// ------------------ CRON SCHEDULER ------------------
export const scheduleReminderJob = () => {
  const schedule = isProduction ? '*/1 * * * *' : '*/30 * * * * *';

  try {
    cron.schedule(schedule, reminderJob, { scheduled: true, timezone: 'UTC' });
    console.log(`Reminder job scheduled: "${schedule}"`);
  } catch (cronErr) {
    console.error('Failed to schedule reminder job:', cronErr.message);
  }
};

export default reminderJob;