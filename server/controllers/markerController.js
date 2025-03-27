/**
 * @fileoverview Marker controller handling marker-related operations
 * This module provides functions for creating and retrieving markers with file uploads
 * @module controllers/markerController
 */

const { admin, getMarkers, getStorage } = require('../config');
const logger = require('../utils/logger');

/**
 * Get all markers from the database
 * @async
 * @function getAllMarkers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getAllMarkers = async (req, res) => {
  const reqLogger = req.logger || logger;
  const Markers = getMarkers(); // Get Markers reference when needed
  
  try {
    reqLogger.info('Fetching all markers');
    
    const snapshot = await Markers.get();
    
    const markers = snapshot.docs.map((doc) => {
      const data = doc.data();
      const marker = {
        id: doc.id,
        location: [data.location.latitude, data.location.longitude],
        title: `${data.formType} Report`,
        description: data.notes || 'No description provided',
        moodNotes: data.moodNotes || null,
        images: data.images || [],
        date: data.date instanceof admin.firestore.Timestamp ? data.date.toDate() : data.date || null,
        formType: data.formType || null,
        details: {}
      };

      // Add form-specific details based on type
      switch(data.formType) {
        case "Dumping":
          marker.details = data.dumpingDetails || {};
          marker.description = `Type: ${data.dumpingDetails?.typeOfDumping || 'N/A'}\nLocation: ${data.dumpingDetails?.locationOfDumping || 'N/A'}\nAmount: ${data.dumpingDetails?.amountOfDumping || 'N/A'}\n${marker.description}`;
          break;
        case "StandingWater":
          marker.details = data.standingWaterDetails || {};
          marker.description = `Weather: ${data.standingWaterDetails?.weatherCondition || 'N/A'}\nLocation: ${data.standingWaterDetails?.standingWaterLocation || 'N/A'}\nMold: ${data.standingWaterDetails?.presenceOfMold || 'N/A'}\n${marker.description}`;
          break;
        case "Stormwater":
          marker.details = data.stormwaterProblemDetails || {};
          marker.description = `Location: ${data.stormwaterProblemDetails?.stormwaterProblemLocation || 'N/A'}\nProblem: ${data.stormwaterProblemDetails?.stormwaterProblemType || 'N/A'}\nCause: ${data.stormwaterProblemDetails?.causeOfClog || 'N/A'}\n${marker.description}`;
          break;
        default:
          // No specific formatting for other types
          break;
      }

      return marker;
    });

    reqLogger.debug(`Retrieved ${markers.length} markers`);
    res.status(200).json(markers);
  } catch (error) {
    reqLogger.error("Failed to fetch markers", { error: error.message, stack: error.stack });
    res.status(500).send({ msg: "Failed to fetch markers", error: error.message });
  }
};

/**
 * Upload a file to Firebase Storage
 * @async
 * @function uploadFileToStorage
 * @param {Object} file - File object from multer
 * @param {string} folderPath - Path in storage bucket
 * @param {Object} reqLogger - Logger instance
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
const uploadFileToStorage = async (file, folderPath, reqLogger) => {
  const storage = getStorage();
  const bucket = storage.bucket();
  const fileName = `${folderPath}/${Date.now()}_${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  reqLogger.debug(`Uploading file: ${fileName}`, { 
    contentType: file.mimetype, 
    size: file.size
  });

  // Upload the file
  await fileUpload.save(file.buffer, {
    metadata: { 
      contentType: file.mimetype,
      metadata: {
        fileType: file.mimetype.split('/')[0]
      }
    },
  });

  // Make the file public
  await fileUpload.makePublic();

  // Return the public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  reqLogger.debug(`File uploaded successfully: ${fileName}`, { publicUrl });
  
  return publicUrl;
};

/**
 * Save a new marker to the database with optional file uploads
 * @async
 * @function saveMarker
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body with marker details
 * @param {string} req.body.location - JSON string of latitude/longitude
 * @param {string} req.body.formType - Type of form (Dumping, StandingWater, Stormwater)
 * @param {Object} req.files - Uploaded files (images and videos)
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const saveMarker = async (req, res) => {
  const reqLogger = req.logger || logger;
  const Markers = getMarkers(); // Get Markers reference when needed
  
  try {
    const {
      location: locationString,
      formType,
      moodNotes,
      date,
      notes,
      typeOfDumping,
      locationOfDumping,
      amountOfDumping,
      weatherCondition,
      standingWaterLocation,
      presenceOfMold,
      stormwaterProblemLocation,
      stormwaterProblemType,
      causeOfClog,
    } = req.body;

    reqLogger.debug('Creating new marker', { formType });

    // Parse location from the request body
    const location = locationString ? JSON.parse(locationString) : null;
    if (!location || !location.latitude || !location.longitude || !formType) {
      reqLogger.warn('Missing required marker data', { 
        hasLocation: !!location,
        formType 
      });
      return res.status(400).send({ msg: "Location (latitude, longitude) and form type are required" });
    }

    // Initialize marker data
    const markerData = {
      location: new admin.firestore.GeoPoint(location.latitude, location.longitude),
      formType,
      moodNotes: moodNotes || null,
      date: date || admin.firestore.FieldValue.serverTimestamp(),
      notes: notes || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Handle form-specific details based on form type
    switch(formType) {
      case 'Dumping':
        markerData.dumpingDetails = {
          typeOfDumping: typeOfDumping || null,
          locationOfDumping: locationOfDumping || null,
          amountOfDumping: amountOfDumping || null,
        };
        break;
      case 'StandingWater':
        markerData.standingWaterDetails = {
          weatherCondition: weatherCondition || null,
          standingWaterLocation: standingWaterLocation || null,
          presenceOfMold: presenceOfMold || null,
        };
        break;
      case 'Stormwater':
        markerData.stormwaterProblemDetails = {
          stormwaterProblemLocation: stormwaterProblemLocation || null,
          stormwaterProblemType: stormwaterProblemType || null,
          causeOfClog: causeOfClog || null,
        };
        break;
      default:
        reqLogger.warn(`Unknown form type: ${formType}`);
        break;
    }

    // Initialize arrays for uploaded file URLs
    const uploadedFiles = {
      images: [],
      videos: []
    };

    // Process images
    if (req.files?.images && req.files.images.length > 0) {
      reqLogger.info(`Processing ${req.files.images.length} images`);
      
      for (const file of req.files.images) {
        try {
          const publicUrl = await uploadFileToStorage(file, 'markers/images', reqLogger);
          uploadedFiles.images.push(publicUrl);
        } catch (err) {
          reqLogger.error('Error uploading image', { error: err.message, fileName: file.originalname });
          return res.status(500).send({ msg: "Failed to upload image", error: err.message });
        }
      }
    }

    // Process videos
    if (req.files?.videos && req.files.videos.length > 0) {
      reqLogger.info(`Processing ${req.files.videos.length} videos`);
      
      for (const file of req.files.videos) {
        try {
          const publicUrl = await uploadFileToStorage(file, 'markers/videos', reqLogger);
          uploadedFiles.videos.push(publicUrl);
        } catch (err) {
          reqLogger.error('Error uploading video', { error: err.message, fileName: file.originalname });
          return res.status(500).send({ msg: "Failed to upload video", error: err.message });
        }
      }
    }

    // Add the uploaded file URLs to the marker data
    if (uploadedFiles.images.length > 0) {
      markerData.images = uploadedFiles.images;
    }
    if (uploadedFiles.videos.length > 0) {
      markerData.videos = uploadedFiles.videos;
    }

    reqLogger.debug("Saving marker to database", { 
      formType: markerData.formType,
      location: `${markerData.location.latitude},${markerData.location.longitude}`,
      imagesCount: uploadedFiles.images.length,
      videosCount: uploadedFiles.videos.length
    });

    // Save to Firestore
    const docRef = await Markers.add(markerData);
    
    reqLogger.info('Marker saved successfully', { id: docRef.id });
    res.status(201).send({ 
      msg: "Marker Saved", 
      id: docRef.id,
      uploadedFiles
    });
  } catch (error) {
    reqLogger.error("Failed to save marker", { error: error.message, stack: error.stack });
    res.status(500).send({ msg: "Failed to save marker", error: error.message });
  }
};

module.exports = {
  getAllMarkers,
  saveMarker
};