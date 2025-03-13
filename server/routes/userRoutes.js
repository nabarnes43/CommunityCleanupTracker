/**
 * @fileoverview User-related routes for Community Cleanup Tracker
 * Defines routes for user management operations
 * @module routes/v1/userRoutes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * Route for retrieving all users
 * @route GET /
 * @returns {Array} List of users
 */
router.get('/', userController.getAllUsers);

/**
 * Route for creating a new user
 * @route POST /create
 * @param {Object} req.body User details
 * @returns {Object} Created user information
 */
router.post('/create', userController.createUser);

/**
 * Route for updating an existing user
 * @route POST /update
 * @param {Object} req.body User update details
 * @returns {Object} Update confirmation
 */
router.post('/update', userController.updateUser);

/**
 * Route for deleting a user
 * @route POST /delete
 * @param {Object} req.body User ID to delete
 * @returns {Object} Deletion confirmation
 */
router.post('/delete', userController.deleteUser);

module.exports = router; 