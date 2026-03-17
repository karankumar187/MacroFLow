const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DailyLog = require('../models/DailyLog');
const { chatWithCoach } = require('../services/gemini');

// Chat with AI Coach
router.post('/', async (req, res) => {
  try {
    const { userId, message } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get last 3 days of logs for context
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const startDate = threeDaysAgo.toISOString().split('T')[0];

    const recentLogs = await DailyLog.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    const response = await chatWithCoach(message, user, recentLogs);

    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
