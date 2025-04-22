/**
 * @fileoverview Routes for problem reports
 * @module routes/problemRoutes
 */

const express = require('express');
const router = express.Router();
const { createProblem, getAllProblems } = require('../controllers/problemController');

/**
 * @route POST /api/problems
 * @description Create a new problem report
 * @access Public
 */
router.post('/', createProblem);

/**
 * @route GET /api/problems
 * @description Get all problem reports
 * @access Public
 */
router.get('/', getAllProblems);

module.exports = router; 