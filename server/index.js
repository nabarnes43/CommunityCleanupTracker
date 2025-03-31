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

// Special Cloud Run status endpoints
app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'OK', 
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    inCloudRun: Boolean(process.env.K_SERVICE || process.env.K_REVISION)
  });
});

app.get('/ready', (req, res) => {
  res.status(200).send('Ready');
});

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

// Global error handlers to prevent container exit
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  logger.error('Uncaught exception', { 
    error: error.message, 
    stack: error.stack,
    environment: process.env.NODE_ENV || 'unknown'
  });
  // Don't exit - keep container alive in Cloud Run
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  logger.error('Unhandled promise rejection', { 
    reason: reason?.message || String(reason),
    stack: reason?.stack,
    environment: process.env.NODE_ENV || 'unknown'
  });
  // Don't exit - keep container alive in Cloud Run
});

/**
 * Server port, uses environment variable or fallbacks to 4000
 * @type {number}
 */
const PORT = process.env.PORT || 4000;

/**
 * Start the web server
 */
async function startServer() {
  // CRITICAL: Set NODE_ENV to production if in Cloud Run to prevent development-specific behavior
  const isCloudRun = Boolean(process.env.K_SERVICE || process.env.K_REVISION || process.env.K_CONFIGURATION);
  if (isCloudRun && !process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
    console.log('Automatically set NODE_ENV to production in Cloud Run environment');
  }

  console.log('Starting server initialization...');
  console.log(`Detected environment: ${isCloudRun ? 'Cloud Run' : 'standard'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  
  if (isCloudRun) {
    console.log('Running in Cloud Run environment');
    logger.info('Running in Cloud Run environment');
  }
  
  // Start the web server regardless of Firebase initialization status
  console.log(`Starting server on port ${PORT}...`);
  const server = app.listen(PORT, () => {
    console.log(`SERVER RUNNING on port ${PORT}`);
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (isCloudRun) {
      logger.info('Server started successfully in Cloud Run environment');
    }
  });

  // Initialize Firebase in parallel, after server is already listening
  try {
    console.log('Initializing Firebase...');
    try {
      const firebaseResult = await initializeFirebase();
      if (firebaseResult.success) {
        console.log('Firebase initialized successfully');
      } else {
        console.error('Firebase initialization failed:', firebaseResult.error);
        logger.error('Server running without Firebase initialization', {
          error: firebaseResult.error,
          environment: process.env.NODE_ENV,
          isCloudRun: isCloudRun
        });
        
        if (isCloudRun) {
          logger.warn('Cloud Run instance running without Firebase. Only health check and non-Firebase endpoints will work.');
        } else {
          // In non-Cloud Run environments, log but don't exit
          console.error('Firebase initialization failed in development mode, but server will continue running');
          logger.error('Firebase initialization failed in development mode');
        }
      }
    } catch (firebaseError) {
      // Log the error but continue running - server is already started
      console.error('Firebase initialization failed:', firebaseError.message);
      logger.error('Server running without Firebase initialization', {
        error: firebaseError.message,
        environment: process.env.NODE_ENV,
        isCloudRun: isCloudRun
      });
      
      if (isCloudRun) {
        logger.warn('Cloud Run instance running without Firebase. Only health check and non-Firebase endpoints will work.');
      } else {
        // In non-Cloud Run environments, log but don't exit
        console.error('Firebase initialization failed in development mode, but server will continue running');
        logger.error('Firebase initialization failed in development mode');
      }
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

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received. Shutting down gracefully.');
      server.close(() => {
        logger.info('HTTP server closed.');
        // Allow logs to flush before exiting
        setTimeout(() => {
          console.log('Clean shutdown complete');
          // Use exit with success code, which is safe for Cloud Run
          process.exit(0);
        }, 1000);
      });
    });
    
    return server;
  } catch (error) {
    // Server is already running, just log the error
    console.error('ERROR during initialization:', error);
    logger.error('Error during server initialization', {
      error: error.message,
      stack: error.stack,
      environment: process.env.NODE_ENV,
      isCloudRun: isCloudRun
    });
    
    // Never exit - the server is already running
    return server;
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer }; // For testing purposes
