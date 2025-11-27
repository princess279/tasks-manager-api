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
    const tasks = await Task.find({ status: 'pending' }).populate('user', 'email name timezone');

    if (tasks.length === 0) console.log('No pending tasks found.');

    for (const task of tasks) {
      const user = task.user;
      if (!user || !user.email) {
        console.log(`Task "${task.title}" has no user or email, skipping.`);
        continue;
      }

      const userTz = user.timezone || 'UTC';
      const now = nowUTC.setZone(userTz);

      let shouldSend = false;

      console.log(`Checking task "${task.title}" (ReminderSent: ${task.reminderSent})`);

      // Force sending for testing if reminderSent = false
      if (!task.reminderSent) {
        if (task.reminderTime) {
          const [h, m] = task.reminderTime.split(':');
          const taskReminderTime = now.set({ hour: Number(h), minute: Number(m), second: 0, millisecond: 0 });
          const diffMinutes = Math.abs(now.diff(taskReminderTime, 'minutes').minutes);
          console.log(`Now: ${now.toFormat('HH:mm')}, Task reminderTime: ${taskReminderTime.toFormat('HH:mm')}, Diff: ${diffMinutes} min`);

          // ±5 minutes window
          if (diffMinutes <= 5) shouldSend = true;
        } else {
          // Default 8 AM reminder
          if (now.hour === 8 && now.minute <= 1) shouldSend = true;
        }
      } else {
        console.log(`Task "${task.title}" already sent, skipping.`);
      }

      if (shouldSend) {
        console.log(`Sending email for task "${task.title}" to ${user.email}...`);
        await sendEmail(
          user.email,
          `Reminder: "${task.title}" is due${DateTime.fromJSDate(task.dueDate).toFormat(' yyyy-MM-dd')}`,
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