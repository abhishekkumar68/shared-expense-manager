const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import all models and associations
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running normally' });
});

// Sync database and start server
// alter:true updates existing tables without dropping data (safe for development)
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully.');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to sync database:', err);
});
