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

// Base route
router.get('/', (req, res) => {
  res.json({
    name: 'Community Cleanup Tracker API',
    version: '1.0.0',
    status: 'active'
  });
});

// Create API router to group all API routes
const apiRouter = express.Router();

// API test route
apiRouter.get('/', apiTest);

// Mount route modules under API router
apiRouter.use('/users', userRoutes);
apiRouter.use('/markers', markerRoutes);
apiRouter.use('/email', emailRoutes);

// Mount API router under /api path
router.use('/api', apiRouter);

module.exports = router;
