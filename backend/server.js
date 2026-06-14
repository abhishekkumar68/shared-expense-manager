const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize DB connection
const sequelize = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running normally' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
