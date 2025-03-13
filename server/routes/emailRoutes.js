/**
 * @fileoverview Email-related routes for Community Cleanup Tracker
 * Defines routes for email operations
 * @module routes/v1/emailRoutes
 */

const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

/**
 * Route for sending a test email
 * @route GET /send
 * @returns {Object} Email sending result
 */
router.get('/send', emailController.sendMail);

/**
 * Route for retrieving emails for a specific address
 * @route GET /list/:email
 * @param {string} email Email address to fetch emails for
 * @returns {Array} List of email threads
 */
router.get('/list/:email', emailController.getMails);

module.exports = router; 