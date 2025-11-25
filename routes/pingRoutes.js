import express from 'express';
const router = express.Router();

// This route is used by Render Cron to keep your server awake
router.get('/ping', (req, res) => {
  console.log('Ping received at', new Date().toISOString());
  res.status(200).json({ message: 'Pong' });
});

export default router;