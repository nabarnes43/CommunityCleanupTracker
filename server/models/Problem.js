/**
 * @fileoverview Problem model for Community Cleanup Tracker
 * Defines the structure and validation for reported problems
 * @module models/Problem
 */
const { z } = require('zod');

/**
 * Problem schema for validation
 * @type {ZodObject}
 */
const ProblemSchema = z.object({
  /**
   * Problem's unique identifier
   */
  id: z.string().optional(),

  /**
   * Type of problem reported
   */
  category: z.string({
    required_error: "Category is required",
    invalid_type_error: "Category must be a string"
  }),

  /**
   * User's email address
   */
  email: z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string"
  }).email({ message: "Invalid email address" }),

  /**
   * Description of the problem
   */
  description: z.string({
    required_error: "Description is required",
    invalid_type_error: "Description must be a string"
  }).min(5, { message: "Description must be at least 5 characters long" }),

  /**
   * Timestamp of when the problem was reported
   */
  createdAt: z.date().default(() => new Date()).optional(),

  /**
   * Status of the reported problem
   */
  status: z.enum(['new', 'in-progress', 'resolved']).default('new').optional()
});

/**
 * Validate problem data
 * @function validateProblem
 * @param {Object} problemData - Problem data to validate
 * @returns {Object} Validated problem data
 * @throws {ZodError} If validation fails
 */
function validateProblem(problemData) {
  return ProblemSchema.parse(problemData);
}

/**
 * Partially validate problem data (for updates)
 * @function validatePartialProblem
 * @param {Object} problemData - Partial problem data to validate
 * @returns {Object} Partially validated problem data
 * @throws {ZodError} If validation fails
 */
function validatePartialProblem(problemData) {
  return ProblemSchema.partial().parse(problemData);
}

module.exports = {
  ProblemSchema,
  validateProblem,
  validatePartialProblem
}; 