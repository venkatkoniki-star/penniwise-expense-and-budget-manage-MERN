const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, '');
      const isAllowed =
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.startsWith('http://localhost:') ||
        process.env.NODE_ENV !== 'production' ||
        !process.env.FRONTEND_URL;

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root info & health check
app.get('/', (req, res) =>
  res.json({
    status: 'ok',
    service: 'Penniwise Expense & Budget Manager API',
    timestamp: new Date(),
  })
);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    database: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date(),
  })
);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
