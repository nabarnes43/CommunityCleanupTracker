/**
 * @fileoverview Entry point for the Community Cleanup Tracker server
 * Sets up Express server with middleware and routes
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Replace the require with a dynamic import that will be resolved later
// const addRequestId = require('express-request-id')();
const routes = require('./router'); // Import main router
const logger = require('./utils/logger');
// Firebase is initialized automatically when imported in config/firebase.js

// Middleware imports
const requestLoggerMiddleware = require('./middleware/requestLogger');
const { notFoundHandler, serverErrorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

/**
 * Express application instance
 * @type {express.Application}
 */
const app = express();

// Middleware configuration
// We'll add the request ID middleware after we import it
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Enhanced CORS configuration
app.use(cors({
  origin: '*', // Allow requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Request logging middleware
app.use(requestLoggerMiddleware);

// Use routes - mount at root level since router.js handles base paths
app.use('/', routes); 

// 404 Not Found handler
app.use(notFoundHandler);

// Error handling middleware
app.use(serverErrorHandler);

/**
 * Server port, uses environment variable or fallbacks to 4000
 * @type {number}
 */
const PORT = process.env.PORT || 4000;

/**
 * Start the web server
 */
async function startServer() {
  try {
    // Dynamically import express-request-id
    const expressRequestId = await import('express-request-id');
    const addRequestId = expressRequestId.default();
    
    // Add the request ID middleware
    app.use(addRequestId);
    
    // Start the web server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received. Shutting down gracefully.');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    });
    
    return server;
  } catch (error) {
    logger.error('Failed to start server:', { error: error.message });
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer }; // For testing purposes
