const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const { sendDueReminders } = require('./services/reminder.service');
const flashcardRoutes = require('./routes/flashcard.routes');

const app = express();

app.set('etag', false);
app.set('trust proxy', 1);

app.use(helmet());

const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'studypilot-api', time: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/stats', require('./routes/stats.routes'));
app.use('/api/search', require('./routes/search.routes'));
app.use('/api/flashcards', flashcardRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Run every hour, on the hour
cron.schedule('0 * * * *', () => {
  sendDueReminders().catch((err) => console.error('[reminders] job failed:', err.message));
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'File is too large. Maximum size is 20MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err.message && err.message.includes('Only PDF, DOCX, and TXT')) {
    return res.status(400).json({ message: err.message });
  }

  res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
});

module.exports = app;