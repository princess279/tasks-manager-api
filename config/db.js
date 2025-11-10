// config/db.js
import mongoose from 'mongoose';
import 'dotenv/config'; // Load environment variables from .env automatically

const connectDB = async () => {
  try {
    // Check if MONGO_URI exists
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not found in environment variables');
    }

    // Connect to MongoDB
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      // These options are no longer required in Mongoose 6+
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`Successfully connected to MongoDB at ${connection.connection.host}`);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1); // Exit process if connection fails
  }
};

export default connectDB;