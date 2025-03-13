/**
 * @fileoverview User controller handling user-related operations
 * This module provides functions for CRUD operations on users
 * @module controllers/userController
 */

const { User } = require('../config');
const logger = require('../utils/logger');

/**
 * Get all users from the database
 * @async
 * @function getAllUsers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getAllUsers = async (req, res) => {
  const reqLogger = req.logger || logger;
  
  try {
    reqLogger.info('Fetching all users');
    
    const snapshot = await User.get();
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    reqLogger.debug(`Retrieved ${list.length} users`);
    res.json(list);
  } catch (error) {
    reqLogger.error('Failed to fetch users', { error: error.message });
    res.status(500).send({ msg: "Failed to fetch users", error: error.message });
  }
};

/**
 * Create a new user in the database
 * @async
 * @function createUser
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - User's name
 * @param {string} req.body.college - User's college
 * @param {number|string} req.body.age - User's age
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const createUser = async (req, res) => {
  const reqLogger = req.logger || logger;
  const { name, college, age } = req.body;

  reqLogger.debug('Create user request received', { name, college, age });

  if (!name || !college || !age) {
    reqLogger.warn('Missing required fields for user creation', { 
      provided: { name: !!name, college: !!college, age: !!age } 
    });
    return res.status(400).send({ msg: "Name, College, and Age are required" });
  }

  const userData = {
    name,
    college,
    age: parseInt(age, 10),
  };

  try {
    reqLogger.info('Creating new user', { name });
    await User.add(userData);
    
    reqLogger.info('User created successfully', { name });
    res.send({ msg: "User Added" });
  } catch (error) {
    reqLogger.error('Failed to add user', { error: error.message, userData });
    res.status(500).send({ msg: "Failed to add user", error: error.message });
  }
};

/**
 * Update an existing user in the database
 * @async
 * @function updateUser
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.id - User ID to update
 * @param {string} [req.body.name] - Updated user name
 * @param {string} [req.body.college] - Updated user college
 * @param {number|string} [req.body.age] - Updated user age
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const updateUser = async (req, res) => {
  const reqLogger = req.logger || logger;
  const { id, name, college, age } = req.body;

  reqLogger.debug('Update user request received', { id, name, college, age });

  if (!id) {
    reqLogger.warn('Missing user ID for update operation');
    return res.status(400).send({ msg: "User ID is required" });
  }

  // Build update data object with only provided fields
  const updatedData = {};
  if (name) updatedData.name = name;
  if (college) updatedData.college = college;
  if (age) updatedData.age = parseInt(age, 10);

  try {
    reqLogger.info('Updating user', { id });
    await User.doc(id).update(updatedData);
    
    reqLogger.info('User updated successfully', { id });
    res.send({ msg: "Updated" });
  } catch (error) {
    reqLogger.error('Failed to update user', { id, error: error.message });
    res.status(500).send({ msg: "Failed to update user", error: error.message });
  }
};

/**
 * Delete a user from the database
 * @async
 * @function deleteUser
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.id - User ID to delete
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const deleteUser = async (req, res) => {
  const reqLogger = req.logger || logger;
  const { id } = req.body;

  reqLogger.debug('Delete user request received', { id });

  if (!id) {
    reqLogger.warn('Missing user ID for delete operation');
    return res.status(400).send({ msg: "ID is required" });
  }

  try {
    reqLogger.info('Deleting user', { id });
    await User.doc(id).delete();
    
    reqLogger.info('User deleted successfully', { id });
    res.send({ msg: "Deleted" });
  } catch (error) {
    reqLogger.error('Failed to delete user', { id, error: error.message });
    res.status(500).send({ msg: "Failed to delete user", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
}; 