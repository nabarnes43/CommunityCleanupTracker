/**
 * @fileoverview Config module index file
 * Exports all configuration modules for easy importing
 * @module config
 */

// Export all firebase configurations
const firebase = require('./firebase');

// Export email configuration if needed
const email = require('./email');

// Export everything
module.exports = {
  ...firebase,
  email
}; 