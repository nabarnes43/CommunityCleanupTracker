/**
 * @fileoverview Request logging middleware for the Community Cleanup Tracker
 * Provides centralized request logging functionality
 * @module middleware/requestLogger
 */

const logger = require('../utils/logger');

/**
 * Middleware to log incoming requests and their responses
 * @function requestLoggerMiddleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requestLoggerMiddleware = (req, res, next) => {
  const reqLogger = logger.requestLogger(req);
  req.logger = reqLogger; // Attach logger to request object
  
  reqLogger.info(`Request received: ${req.method} ${req.url}`);
  
  // Log response after it's sent
  res.on('finish', () => {
    reqLogger.info(`Response sent: ${res.statusCode}`);
  });
  
  next();
};

module.exports = requestLoggerMiddleware; 