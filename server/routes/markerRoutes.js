/**
 * @fileoverview Marker-related routes for Community Cleanup Tracker
 * Defines routes for marker management and creation
 * @module routes/v1/markerRoutes
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const markerController = require('../controllers/markerController');
const logger = require('../utils/logger');

/**
 * Multer configuration for file uploads
 * Using memory storage to buffer files before processing
 */
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB file size limit
    files: 7 // Maximum 7 files total (5 images + 2 videos)
  }
});

/**
 * Route for retrieving all markers
 * @route GET /
 * @returns {Array} List of markers
 */
router.get('/', markerController.getAllMarkers);

/**
 * Route for creating a new marker with file uploads
 * @route POST /create
 * @param {Object} req.body Marker details
 * @param {Array} req.files.images Optional image files
 * @param {Array} req.files.videos Optional video files
 * @returns {Object} Created marker information
 */
router.post('/create', 
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 2 }
  ]), 
  async (req, res) => {
    const reqLogger = req.logger || logger;
    
    reqLogger.debug('Processing marker creation request', {
      formFields: req.body,
      filesInfo: {
        images: req.files?.images?.length || 0,
        videos: req.files?.videos?.length || 0
      }
    });

    try {
      await markerController.saveMarker(req, res);
    } catch (error) {
      reqLogger.error('Failed to save marker', { 
        error: error.message,
        stack: error.stack 
      });
      
      res.status(500).send({ 
        msg: 'Failed to save marker', 
        error: error.message 
      });
    }
  }
);

module.exports = router; 