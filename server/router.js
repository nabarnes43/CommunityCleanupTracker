/**
 * @fileoverview Main router configuration for Community Cleanup Tracker
 * Combines and mounts all API route modules
 * @module router
 */

const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./routes/userRoutes');
const markerRoutes = require('./routes/markerRoutes');
const emailRoutes = require('./routes/emailRoutes');

// Import utility controller for API test
const { apiTest } = require('./controllers/utilController');

// Base API routes
router.get('/', (req, res) => {
  res.json({
    name: 'Community Cleanup Tracker API',
    version: '1.0.0',
    status: 'active'
  });
});

// API test route
router.get('/api', apiTest);

// Mount route modules - no versioning
router.use('/users', userRoutes);
router.use('/markers', markerRoutes);
router.use('/email', emailRoutes);

module.exports = router;
