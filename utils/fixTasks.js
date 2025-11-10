// utils/fixTasks.js
import Task from '../models/Task.js';
import User from '../models/User.js';

export const fixTasks = async () => {
  const tasks = await Task.find({});

  for (const task of tasks) {
    let updated = false;

    // Fix dueDate if stored as string
    if (typeof task.dueDate === 'string') {
      task.dueDate = new Date(task.dueDate);
      updated = true;
      console.log(`Fixed dueDate for task "${task.title}"`);
    }

    // Ensure user exists and has timezone/email
    if (!task.user) {
      console.log(`Task "${task.title}" has no user assigned — skipping`);
    } else {
      const user = await User.findById(task.user);
      if (!user) {
        console.log(`Task "${task.title}" has invalid user ID — skipping`);
      } else {
        if (!user.timezone) {
          user.timezone = 'UTC';
          await user.save();
          console.log(`Added default timezone for user "${user.name}"`);
        }
        if (!user.email) {
          console.log(`Warning: User "${user.name}" has no email — task "${task.title}" cannot be reminded`);
        }
      }
    }

    if (updated) await task.save();
  }

  console.log('Task and user data fix completed.');
  return 'Task and user data fix completed.';
};