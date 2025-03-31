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
const admin = require('firebase-admin');

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
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'not set',
    port: process.env.PORT || 'not set',
    firebaseInitialized: Boolean(admin?.apps?.length > 0)
  };
  
  res.status(200).json(healthStatus);
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
    try {
      await initializeFirebase();
      console.log('Firebase initialized successfully');
    } catch (firebaseError) {
      // Log the error but don't exit - in Cloud Run, we want to start the server anyway
      console.error('Firebase initialization failed:', firebaseError.message);
      logger.error('Server starting without Firebase initialization', {
        error: firebaseError.message,
        environment: process.env.NODE_ENV
      });
      // In production, we'll still start the server but certain endpoints might fail
    }
    
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
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
      environment: process.env.NODE_ENV
    });
    // Don't exit immediately in production to allow logs to be captured
    if (process.env.NODE_ENV === 'production') {
      // In Cloud Run, we'll log the error but still try to start a minimal server
      // This prevents the container from exiting with code 1
      try {
        const minimalServer = app.listen(PORT, () => {
          console.log(`MINIMAL SERVER RUNNING on port ${PORT} (Firebase failed)`);
          logger.info('Minimal server running - Firebase initialization failed');
        });
        return minimalServer;
      } catch (serverError) {
        logger.error('Even minimal server failed to start', { error: serverError.message });
        // Wait 5 seconds before exiting to ensure logs are captured
        setTimeout(() => process.exit(1), 5000);
      }
    } else {
      // In development, exit immediately
      process.exit(1);
    }
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer }; // For testing purposes
