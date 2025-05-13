/**
 * @fileoverview Controller for handling problem reports
 * @module controllers/problemController
 */

const admin = require('firebase-admin');
const { validateProblem, validatePartialProblem } = require('../models/Problem');
const logger = require('../utils/logger');

// Collection reference
const problemsCollection = 'problems';

/**
 * Create a new problem report
 * @async
 * @function createProblem
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
async function createProblem(req, res) {
  try {
    // Validate the request body
    const validatedData = validateProblem({
      ...req.body,
      createdAt: new Date()
    });

    // Create a new document in Firestore
    const db = admin.firestore();
    const docRef = await db.collection(problemsCollection).add(validatedData);

    // Return the created problem with its ID
    res.status(201).json({
      id: docRef.id,
      ...validatedData,
      message: 'Problem report submitted successfully'
    });
  } catch (error) {
    logger.error('Error creating problem report', { error: error.message });
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Invalid problem data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      error: 'Failed to create problem report',
      message: error.message
    });
  }
}

/**
 * Get all problem reports
 * @async
 * @function getAllProblems
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
async function getAllProblems(req, res) {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection(problemsCollection).get();
    
    if (snapshot.empty) {
      return res.status(200).json({ problems: [] });
    }
    
    const problems = [];
    snapshot.forEach(doc => {
      problems.push({ id: doc.id, ...doc.data() });
    });
    
    res.status(200).json({ problems });
  } catch (error) {
    logger.error('Error getting all problems', { error: error.message });
    res.status(500).json({
      error: 'Failed to retrieve problem reports',
      message: error.message
    });
  }
}

module.exports = {
  createProblem,
  getAllProblems
}; 