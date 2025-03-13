/**
 * @fileoverview Error handling middleware for the Community Cleanup Tracker
 * Provides centralized error handling and logging
 * @module middleware/errorHandler
 */

const logger = require('../utils/logger');

/**
 * Middleware to handle 404 Not Found errors
 * @function notFoundHandler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFoundHandler = (req, res) => {
  const reqLogger = req.logger || logger;
  reqLogger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
};

/**
 * Middleware to handle server errors
 * @function serverErrorHandler
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const serverErrorHandler = (err, req, res, next) => {
  const reqLogger = req.logger || logger;
  
  // Log the error
  reqLogger.error('Server error', { 
    error: err.message, 
    stack: err.stack,
    method: req.method,
    url: req.url
  });

  // Determine the appropriate status code
  const statusCode = err.status || 500;

  // Send error response
  res.status(statusCode).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
};

module.exports = {
  notFoundHandler,
  serverErrorHandler
}; 