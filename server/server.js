const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://0.0.0.0:8000',
    'https://btran54.github.io'  
  ]
}));

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/ships', require('./routes/ships'));
app.use('/api/auxiliary', require('./routes/auxiliary'));
app.use('/api/augments', require('./routes/augments'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Blue Road eHP API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});