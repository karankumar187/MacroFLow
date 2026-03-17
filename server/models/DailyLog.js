const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  estimatedWeight: { type: Number, default: 0 }, // grams
  source: { type: String, enum: ['text', 'photo'], default: 'text' },
  loggedAt: { type: Date, default: Date.now }
});

const dailyLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD format for easy querying
  meals: [mealSchema]
}, { timestamps: true });

// Index for efficient lookups
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

// Virtual to compute daily totals
dailyLogSchema.virtual('totals').get(function() {
  return this.meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
});

dailyLogSchema.set('toJSON', { virtuals: true });
dailyLogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
