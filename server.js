import express from 'express';
import cors from 'cors'; 
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { reminderJob, scheduleReminderJob } from './jobs/reminderJob.js';

// Test / dev routes
import testEmailRoute from './routes/testEmail.js'; // routes folder
import testTasksRoute from './test/testTask.js';   // test folder
import { fixTasks } from './utils/fixTasks.js';    // utils folder

const app = express();
connectDB();

// Enable CORS for your frontend Render URL
app.use(cors({
  origin: ['https://localhost:5173',// local dev
           'https://task-manager-frontend-eovn.onrender.com' // your deployed frontend
  ],
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Health check
app.get('/', (req, res) => res.send('Server is running successfully!'));

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

// Centralized error handling
app.use(errorHandler);

// Start server and schedule cron jobs
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  scheduleReminderJob();
});