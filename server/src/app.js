const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Config cors
app.use(cors({
  origin: '*', // Allow all origins for MVP simplicity
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload files
// Expose the uploads folder at "/uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'GraamSahayak API is running smoothly' });
});

// Bind API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/birth', require('./routes/birthRoutes'));
app.use('/api/death', require('./routes/deathRoutes'));

// Centralized error handler
app.use(errorHandler);

module.exports = app;
