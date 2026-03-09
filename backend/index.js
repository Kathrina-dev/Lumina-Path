const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const safeRouteRoutes = require("./routes/safeRoute");
const crowdRoutes = require("./routes/crowd");
const lightingRoutes = require("./routes/lighting");
const reportsRoutes = require("./routes/reports");
const safePlacesRoutes = require("./routes/Safeplaces");

const PORT = 5000;

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Lumina Path API',
    version: '1.0.0',
    status: 'operational'
  });
});

// API Routes
app.use("/api/safe-route", safeRouteRoutes);
app.use("/api/crowd", crowdRoutes);
app.use("/api/lighting", lightingRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/safe-places", safePlacesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Lumina Path Server running on port ${PORT}`);
});