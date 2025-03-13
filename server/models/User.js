/**
 * @fileoverview User model for Community Cleanup Tracker
 * Defines the structure and validation for user data
 * @module models/User
 */
//TODO Integrate this with the databaseMapper and the controllers. 
const { z } = require('zod');

/**
 * User schema for validation
 * @type {ZodObject}
 */
const UserSchema = z.object({
  /**
   * User's unique identifier
   */
  id: z.string().optional(),

  /**
   * User's full name
   */
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string"
  }).min(2, { message: "Name must be at least 2 characters long" }),

  /**
   * User's college or institution
   */
  college: z.string({
    required_error: "College is required",
    invalid_type_error: "College must be a string"
  }).min(2, { message: "College name must be at least 2 characters long" }),

  /**
   * User's age
   */
  age: z.number({
    required_error: "Age is required",
    invalid_type_error: "Age must be a number"
  }).int({ message: "Age must be an integer" })
    .min(16, { message: "Minimum age is 16" })
    .max(120, { message: "Maximum age is 120" }),

  /**
   * Optional user email
   */
  email: z.string().email({ message: "Invalid email address" }).optional(),

  /**
   * Timestamp of user creation
   */
  createdAt: z.date().optional(),

  /**
   * Optional user role or permissions
   */
  role: z.enum(['user', 'admin', 'moderator']).default('user').optional()
});

/**
 * Validate user data
 * @function validateUser
 * @param {Object} userData - User data to validate
 * @returns {Object} Validated user data
 * @throws {ZodError} If validation fails
 */
function validateUser(userData) {
  return UserSchema.parse(userData);
}

/**
 * Partially validate user data (for updates)
 * @function validatePartialUser
 * @param {Object} userData - Partial user data to validate
 * @returns {Object} Partially validated user data
 * @throws {ZodError} If validation fails
 */
function validatePartialUser(userData) {
  return UserSchema.partial().parse(userData);
}

module.exports = {
  UserSchema,
  validateUser,
  validatePartialUser
}; 