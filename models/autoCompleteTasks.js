import cron from 'node-cron';
import Task from '../models/Task.js';

export const scheduleAutoCompleteTasks = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      const tasksToComplete = await Task.find({
        completed: false,
        dueDate: { $lte: now }, // only dueDate triggers auto-complete
      });

      for (let task of tasksToComplete) {
        task.completed = true;
        task.autoCompleted = true; // flag for UI
        await task.save();
        console.log(`Task "${task.title}" auto-completed`);
      }
    } catch (err) {
      console.error('Error auto-completing tasks:', err);
    }
  });
};