import cron from 'node-cron';
import Task from '../models/Task.js'; // Your Mongoose Task model

export const scheduleAutoCompleteTasks = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Find tasks that are not completed and are past dueDate or reminderTime
      const tasksToComplete = await Task.find({
        completed: false,
        $or: [
          { dueDate: { $lte: now } },
          { reminderTime: { $lte: now } },
        ],
      });

      for (let task of tasksToComplete) {
        task.completed = true;
        await task.save();
        console.log(`Task "${task.title}" automatically marked as completed`);
      }
    } catch (err) {
      console.error('Error auto-completing tasks:', err);
    }
  });
};