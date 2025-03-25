const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Define routes here
app.get('/', (req, res) => {
  res.send('Welcome to the we-safe API');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
