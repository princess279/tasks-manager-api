// seedTestReminder.js
import mongoose from 'mongoose';
import User from './models/User.js';
import Task from './models/Task.js';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI;

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Create a test user
  let user = await User.findOne({ email: 'ogabuprecious19@gmail.com' });
  if (!user) {
    user = await User.create({
      name: 'Ogabu precious',
      email: 'Ogabuprecious19@gmail.com',
      timezone: 'Africa/Lagos', // you can change timezone to test global reminders
    });
    console.log('Created test user:', user.email);
  } else {
    console.log('Test user already exists:', user.email);
  }

  // 2️⃣ Create a task due today for that user
  const dueDate = new Date();
  dueDate.setUTCHours(0, 0, 0, 0); // start of day UTC

  const task = await Task.create({
    title: 'Test Reminder Task',
    description: 'Task to test email reminders',
    dueDate,
    status: 'pending',
    reminderSent: false,
    user: user._id,
  });

  console.log('Created test task:', task.title);

  mongoose.disconnect();
};

run();