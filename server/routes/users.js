const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Create or update user profile (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const updateFields = ['name', 'currentWeight', 'targetWeight', 'height',
      'age', 'gender', 'activityLevel', 'dietStyle'];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    user.profileComplete = true;
    user.calculateGoals();
    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
