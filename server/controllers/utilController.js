/**
 * @fileoverview Utility controller for testing and miscellaneous endpoints
 * @module controllers/utilController
 */

const logger = require('../utils/logger');

/**
 * Simple API test endpoint that returns mock data
 * Used for testing API connectivity
 * @function apiTest
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const apiTest = (req, res) => {
  const reqLogger = req.logger || logger;
  
  reqLogger.debug('API test endpoint called');
  
  res.json({ 
    "users": ["userOne", "userTwo", "userThree", "userFour"],
    "timestamp": new Date().toISOString(),
    "status": "success"
  });
};

module.exports = {
  apiTest
}; 