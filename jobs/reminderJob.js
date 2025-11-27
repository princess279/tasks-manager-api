// ReminderJob.js
import cron from 'node-cron';
import { DateTime } from 'luxon';
import Task from '../models/Task.js';
import User from '../models/User.js';
import sendEmail from '../utils/email.js';

let isRunning = false; // Prevent overlapping executions

// ------------------ ARCHIVE PAST TASKS ------------------
export const archivePastTasks = async () => {
  try {
    const today = DateTime.now().startOf('day').toJSDate();
    const result = await Task.updateMany(
      { 
        dueDate: { $lt: today }, 
        status: 'pending',
        dailyReminder: { $ne: true }
      },
      { $set: { status: 'archived' } }
    );
    console.log(`Archived ${result.modifiedCount} past-due tasks (excluding daily reminders)`);
  } catch (err) {
    console.error('Error archiving past tasks:', err.message);
  }
};

// ------------------ REMINDER JOB ------------------
export const reminderJob = async () => {
  if (isRunning) {
    console.log('Reminder job already running, skipping...');
    return;
  }

  isRunning = true;
  try {
    console.log('Running task reminder job...');
    await archivePastTasks();

    const nowUTC = DateTime.now().setZone('UTC');

    // ------------------ TASK REMINDERS ------------------
    const tasks = await Task.find({ status: 'pending' }).populate('user', 'email name timezone');
    if (tasks.length === 0) console.log('No pending tasks found.');

    for (const task of tasks) {
      const user = task.user;
      if (!user || !user.email) {
        console.log(`Task "${task.title}" has no user/email, skipping.`);
        continue;
      }

      const userTz = user.timezone || 'UTC';
      const now = nowUTC.setZone(userTz);

      let shouldSend = false;

      console.log(`Checking task "${task.title}" (ReminderSent: ${task.reminderSent})`);

      // Only check for tasks due today OR daily reminders
      const due = DateTime.fromJSDate(task.dueDate).setZone(userTz);
      if (!task.dailyReminder && !due.hasSame(now, 'day')) {
        console.log(`Skipping task "${task.title}" — not due today.`);
        continue;
      }

      // Only send if reminder not yet sent
      if (!task.reminderSent) {
        if (task.reminderTime) {
          const [h, m] = task.reminderTime.split(':');
          const taskReminderTime = now.set({ hour: Number(h), minute: Number(m), second: 0, millisecond: 0 });
          const diffMinutes = Math.abs(now.diff(taskReminderTime, 'minutes').minutes);
          console.log(`Now: ${now.toFormat('HH:mm')}, Task reminderTime: ${taskReminderTime.toFormat('HH:mm')}, Diff: ${diffMinutes} min`);
          if (diffMinutes <= 5) shouldSend = true; // ±5 min window
        } else {
          // Default 8 AM reminder
          if (now.hour === 8 && now.minute <= 1) shouldSend = true;
        }
      } else {
        console.log(`Task "${task.title}" already sent, skipping.`);
      }

      if (shouldSend) {
        console.log(`Sending task reminder for "${task.title}" to ${user.email}...`);
        await sendEmail(
          user.email,
          `Reminder: "${task.title}" is due${due.toFormat(' yyyy-MM-dd')}`,
          `Hi ${user.name || 'there'},<br>Your task "<b>${task.title}</b>" is due.<br>— Task Manager`
        );
        task.reminderSent = true;
        await task.save();
        console.log(`Task reminder sent for "${task.title}"`);
      }
    }

    // ------------------ DAILY USER REMINDERS ------------------
    const users = await User.find({ dailyReminder: true, reminderTime: { $exists: true, $ne: null } });
    for (const user of users) {
      const userTz = user.timezone || 'UTC';
      const now = nowUTC.setZone(userTz);
      const [h, m] = user.reminderTime.split(':');
      const dailyReminderTime = now.set({ hour: Number(h), minute: Number(m), second: 0, millisecond: 0 });
      const diffMinutes = Math.abs(now.diff(dailyReminderTime, 'minutes').minutes);

      if (diffMinutes <= 5) {
        console.log(`Sending daily reminder to ${user.email}...`);
        await sendEmail(
          user.email,
          'Daily Reminder',
          `Hi ${user.name || 'there'},<br>This is your daily reminder from Task Manager.<br>— Task Manager`
        );
        console.log(`Daily reminder sent to ${user.email}`);
      } else {
        console.log(`Skipping daily reminder for ${user.email}, not time yet.`);
      }
    }

  } catch (err) {
    console.error('Error running reminder job:', err.message);
  } finally {
    isRunning = false;
  }
};

// ------------------ CRON SCHEDULER ------------------
export const scheduleReminderJob = () => {
  const schedule = '* * * * *'; // every minute
  try {
    cron.schedule(schedule, reminderJob, { scheduled: true, timezone: 'UTC' });
    console.log(`Reminder job scheduled: "${schedule}"`);
  } catch (cronErr) {
    console.error('Failed to schedule reminder job:', cronErr.message);
  }
};

export default reminderJob;