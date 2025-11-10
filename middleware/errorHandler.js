import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logErrorToFile = (logFile, message) => {
  fs.appendFile(logFile, message, (err) => {
    if (err) console.error('Failed to write error log:', err);
  });
};

export const errorHandler = (err, req, res, next) => {
  const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${err.message}\n${err.stack}\n`;

  // Log to console
  console.error(logMessage);

  // Optional: log to file
  const logFile = path.join(__dirname, '../logs/error.log');
  logErrorToFile(logFile, logMessage);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
};

export default errorHandler;