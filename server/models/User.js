const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // null for Google-only users
  googleId: { type: String },
  avatar: { type: String },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  currentWeight: { type: Number, default: 70 },
  targetWeight: { type: Number, default: 70 },
  height: { type: Number, default: 170 },
  age: { type: Number, default: 25 },
  gender: { type: String, enum: ['male', 'female'], default: 'male' },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'veryActive'],
    default: 'moderate'
  },
  dietStyle: {
    type: String,
    enum: ['balanced', 'highProtein', 'keto', 'lowFat'],
    default: 'balanced'
  },
  tdee: { type: Number, default: 0 },
  calorieGoal: { type: Number, default: 0 },
  macroGoals: {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  profileComplete: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate TDEE and macro goals
userSchema.methods.calculateGoals = function() {
  let bmr;
  if (this.gender === 'male') {
    bmr = 10 * this.currentWeight + 6.25 * this.height - 5 * this.age + 5;
  } else {
    bmr = 10 * this.currentWeight + 6.25 * this.height - 5 * this.age - 161;
  }

  const multipliers = {
    sedentary: 1.2, light: 1.375, moderate: 1.55,
    active: 1.725, veryActive: 1.9
  };

  this.tdee = Math.round(bmr * (multipliers[this.activityLevel] || 1.55));

  if (this.targetWeight < this.currentWeight) {
    this.calorieGoal = Math.round(this.tdee - 400);
  } else if (this.targetWeight > this.currentWeight) {
    this.calorieGoal = Math.round(this.tdee + 300);
  } else {
    this.calorieGoal = this.tdee;
  }

  const macroSplits = {
    balanced:    { protein: 0.30, carbs: 0.40, fat: 0.30 },
    highProtein: { protein: 0.40, carbs: 0.35, fat: 0.25 },
    keto:        { protein: 0.25, carbs: 0.05, fat: 0.70 },
    lowFat:      { protein: 0.35, carbs: 0.50, fat: 0.15 }
  };

  const split = macroSplits[this.dietStyle] || macroSplits.balanced;
  this.macroGoals = {
    protein: Math.round((this.calorieGoal * split.protein) / 4),
    carbs: Math.round((this.calorieGoal * split.carbs) / 4),
    fat: Math.round((this.calorieGoal * split.fat) / 9)
  };

  return this;
};

// Exclude password from JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
