// Load environment variables immediately
import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors'; 
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { reminderJob, scheduleReminderJob } from './jobs/reminderJob.js';
import cron from 'node-cron';
import Task from './models/Task.js'; // Your Task model

// Test / dev routes
import testEmailRoute from './routes/testEmail.js'; // routes folder
import testTasksRoute from './test/testTask.js';   // test folder
import { fixTasks } from './utils/fixTasks.js';    // utils folder

const app = express();
connectDB();

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://task-manager-frontend-eovn.onrender.com", // production frontend
  "https://tasks-manager-api-vjni.onrender.com/api", // production backend
];

// Enable CORS
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / curl / non-browser requests
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed from this origin"));
    }
  },
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Health check
app.get('/', (req, res) => res.send('Server is running successfully!'));

// ------------------- Ping route for Render Cron -------------------
app.get('/api/ping', (req, res) => {
  console.log('Ping received at', new Date().toISOString());
  res.status(200).json({ message: 'Pong' });
});

// Main API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reminders', reminderRoutes);

// Only mount test / dev routes in non-production
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/test-email', testEmailRoute);
  app.use('/api/test-tasks', testTasksRoute);

  // Wrap fixTasks utility in a route
  app.get('/api/fix-tasks', async (req, res) => {
    try {
      const result = await fixTasks();
      res.status(200).json({ message: result });
    } catch (err) {
      console.error('Error fixing tasks:', err);
      res.status(500).json({ message: 'Failed to fix tasks', error: err.message });
    }
  });
}

// Manual trigger for reminder job
app.get('/api/reminders/trigger-reminders', async (req, res) => {
  try {
    await reminderJob();
    res.status(200).json({ message: 'Reminder job ran successfully!' });
  } catch (err) {
    console.error('Error running reminder job:', err);
    res.status(500).json({ message: 'Failed to run reminder job', error: err.message });
  }
});

// ------------------- Auto-complete Cron Job -------------------
const scheduleAutoCompleteTasks = () => {
  cron.schedule('* * * * *', async () => { // Runs every minute
    try {
      const now = new Date();
      const tasksToComplete = await Task.find({
        completed: false,
        $or: [
          { dueDate: { $lte: now } },
          { reminderTime: { $lte: now } },
        ],
      });

      for (let task of tasksToComplete) {
        task.completed = true;
        task.autoCompleted = true; // make sure your Task model has this field
        await task.save();
        console.log(`Task "${task.title}" automatically marked as completed`);
      }
    } catch (err) {
      console.error('Error auto-completing tasks:', err);
    }
  });
};

// Centralized error handling
app.use(errorHandler);

// Start server and schedule cron jobs
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Schedule task reminders + daily user reminders
  scheduleReminderJob();

  // Schedule auto-complete tasks
  scheduleAutoCompleteTasks();
});