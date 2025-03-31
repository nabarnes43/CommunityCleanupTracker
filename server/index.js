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
const { initializeFirebase} = require('./config/firebase');

// Middleware imports
const requestLoggerMiddleware = require('./middleware/requestLogger');
const { notFoundHandler, serverErrorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Debug logs
console.log('=== SERVER STARTING ===');
console.log(`PORT: ${process.env.PORT || 'not set'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);

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

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

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
  console.log('Starting server initialization...');
  try {
    // Initialize Firebase first
    console.log('Initializing Firebase...');
    await initializeFirebase();
    console.log('Firebase initialized successfully');
    
    try {
      // Dynamically import express-request-id
      const expressRequestId = await import('express-request-id');
      const addRequestId = expressRequestId.default();
      
      // Add the request ID middleware
      app.use(addRequestId);
    } catch (importError) {
      console.error('Failed to import express-request-id:', importError);
      // Continue without request ID middleware
    }
    
    // Start the web server
    console.log(`Starting server on port ${PORT}...`);
    const server = app.listen(PORT, () => {
      console.log(`SERVER RUNNING on port ${PORT}`);
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
    console.error('FATAL: Failed to start server:', error);
    // Don't exit immediately in production to allow logs to be captured
    setTimeout(() => process.exit(1), 5000);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer }; // For testing purposes
