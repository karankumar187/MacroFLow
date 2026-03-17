require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');

const app = express();

// MongoDB connection caching for serverless
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/macroflow';
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
  console.log('✅ Connected to MongoDB');
}

// Connect on import (for serverless warm starts)
connectDB().catch(err => console.error('❌ MongoDB error:', err.message));

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'https://*.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow localhost and any vercel.app subdomain
    if (origin.includes('localhost') || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/chat', require('./routes/chat'));

// Silence favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;
