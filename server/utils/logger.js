/**
 * @fileoverview Logger configuration for the Community Cleanup Tracker application
 * This module sets up Winston logger with different levels and transports
 * Logs will be saved in log files with appropriate rotation
 * @module logger
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

/**
 * Custom format for console output with colorization
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

/**
 * Format for file output (no colors, but with timestamps and structured data)
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

/**
 * Logger configuration with console and file transports
 * @type {winston.Logger}
 */
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels: winston.config.npm.levels,
  format: winston.format.json(),
  defaultMeta: { service: 'community-cleanup-tracker' },
  transports: [
    // Write all logs with importance level of 'error' or less to 'error.log'
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with importance level of 'info' or less to 'combined.log'
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, also log to the console with colorized output
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

/**
 * Wrapper function to add request information to logs
 * @param {Object} req - Express request object
 * @returns {Object} - Logger with request context
 */
logger.requestLogger = (req) => {
  const requestId = req.id || 'unknown';
  const method = req.method || 'unknown';
  const url = req.url || 'unknown';
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  return {
    error: (message, meta = {}) => {
      logger.error(`[${requestId}] ${message}`, { ...meta, method, url, ip });
    },
    warn: (message, meta = {}) => {
      logger.warn(`[${requestId}] ${message}`, { ...meta, method, url, ip });
    },
    info: (message, meta = {}) => {
      logger.info(`[${requestId}] ${message}`, { ...meta, method, url, ip });
    },
    debug: (message, meta = {}) => {
      logger.debug(`[${requestId}] ${message}`, { ...meta, method, url, ip });
    }
  };
};

module.exports = logger; 