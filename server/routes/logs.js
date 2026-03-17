const express = require('express');
const router = express.Router();
const multer = require('multer');
const DailyLog = require('../models/DailyLog');
const { parseFoodInput, parseFoodImage } = require('../services/hf-api');

const upload = multer({ storage: multer.memoryStorage() });

// Helper: get today's date string
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// Parse text and log food
router.post('/parse', async (req, res) => {
  try {
    const { userId, text } = req.body;
    const parsed = await parseFoodInput(text);

    const date = todayStr();
    let log = await DailyLog.findOne({ userId, date });

    if (!log) {
      log = new DailyLog({ userId, date, meals: [] });
    }

    const newMeals = parsed.foods.map(f => ({
      foodName: f.food_name,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      fiber: f.fiber || 0,
      estimatedWeight: f.estimated_weight_g,
      source: 'text',
      loggedAt: new Date()
    }));

    log.meals.push(...newMeals);
    await log.save();

    res.json({ log, parsed: parsed.foods });
  } catch (error) {
    console.error('Error parsing food:', error);
    res.status(500).json({ error: error.message });
  }
});

// Parse photo and log food
router.post('/photo', upload.single('image'), async (req, res) => {
  try {
    const { userId } = req.body;
    const parsed = await parseFoodImage(req.file.buffer, req.file.mimetype);

    const date = todayStr();
    let log = await DailyLog.findOne({ userId, date });

    if (!log) {
      log = new DailyLog({ userId, date, meals: [] });
    }

    const newMeals = parsed.foods.map(f => ({
      foodName: f.food_name,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      fiber: f.fiber || 0,
      estimatedWeight: f.estimated_weight_g,
      source: 'photo',
      loggedAt: new Date()
    }));

    log.meals.push(...newMeals);
    await log.save();

    res.json({ log, parsed: parsed.foods });
  } catch (error) {
    console.error('Error parsing photo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get logs for a user (supports date range via query params)
router.get('/:userId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.params.userId };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    }

    const logs = await DailyLog.find(query).sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get today's log for a user
router.get('/:userId/today', async (req, res) => {
  try {
    const log = await DailyLog.findOne({
      userId: req.params.userId,
      date: todayStr()
    });
    res.json(log || { meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a specific meal from a log
router.delete('/:logId/meal/:mealId', async (req, res) => {
  try {
    const log = await DailyLog.findById(req.params.logId);
    if (!log) return res.status(404).json({ error: 'Log not found' });

    log.meals.pull(req.params.mealId);
    await log.save();

    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
