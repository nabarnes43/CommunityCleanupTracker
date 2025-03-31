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
  console.log('Starting server initialization...');
  
  // Detect if we're running in Cloud Run
  const isCloudRun = Boolean(process.env.K_SERVICE || process.env.K_REVISION || process.env.K_CONFIGURATION);
  console.log(`Detected environment: ${isCloudRun ? 'Cloud Run' : 'standard'}`);
  
  if (isCloudRun) {
    console.log('Running in Cloud Run environment');
    logger.info('Running in Cloud Run environment');
  }
  
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
        environment: process.env.NODE_ENV,
        isCloudRun: isCloudRun
      });
      
      if (isCloudRun) {
        logger.warn('Starting Cloud Run instance without Firebase. Only health check and non-Firebase endpoints will work.');
      } else {
        // In non-Cloud Run environments, we'll still log the error but might want to exit in development
        if (process.env.NODE_ENV !== 'production') {
          // Development environments might want to fail fast
          console.error('Firebase is required in development mode, but will continue execution.');
          logger.error('Firebase initialization failed in development mode');
          // No process.exit to prevent container termination
        }
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
    
    // Start the web server
    console.log(`Starting server on port ${PORT}...`);
    const server = app.listen(PORT, () => {
      console.log(`SERVER RUNNING on port ${PORT}`);
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      if (isCloudRun) {
        logger.info('Server started successfully in Cloud Run environment');
      }
    });

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
    console.error('FATAL: Failed to start server:', error);
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
      environment: process.env.NODE_ENV,
      isCloudRun: isCloudRun
    });
    
    // Don't exit immediately in production or Cloud Run to allow logs to be captured
    if (process.env.NODE_ENV === 'production' || isCloudRun) {
      // In Cloud Run, we'll log the error but still try to start a minimal server
      // This prevents the container from exiting with code 1
      try {
        console.log('Attempting to start minimal server (no Firebase)...');
        const minimalServer = app.listen(PORT, () => {
          console.log(`MINIMAL SERVER RUNNING on port ${PORT} (Firebase failed)`);
          logger.info('Minimal server running - Firebase initialization failed');
          
          if (isCloudRun) {
            console.log('CLOUD RUN: Minimal server started successfully. Health checks should pass now.');
          }
        });
        return minimalServer;
      } catch (serverError) {
        logger.error('Even minimal server failed to start', { 
          error: serverError.message,
          isCloudRun: isCloudRun 
        });
        
        if (isCloudRun) {
          // In Cloud Run, we need to keep the container running to see logs
          console.log('CRITICAL: Could not start server. Entering infinite loop to keep container alive for debugging.');
          // Instead of exiting, keep the process alive to view logs
          setInterval(() => {
            console.log('Container still running. Check logs for errors.');
          }, 30000);
        } else {
          // Log the error but don't exit
          console.error('Critical server error, but continuing execution to prevent container exit');
          logger.error('Critical server error in non-Cloud Run environment', { 
            error: error.message, 
            stack: error.stack 
          });
        }
      }
    } else {
      // In development, log error but don't exit
      console.error('Development environment server error, continuing execution');
      logger.error('Development environment error', { 
        error: error.message, 
        stack: error.stack 
      });
    }
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer }; // For testing purposes
