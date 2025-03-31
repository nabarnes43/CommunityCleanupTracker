const admin = require("firebase-admin");
const logger = require("../utils/logger");
const { getSecret } = require("./secretManager");

// Create placeholders for the services
let db;
let storage;
let User;
let Markers;

/**
 * Initializes Firebase and sets up all Firebase services
 * @returns {Promise<Object>} Result with success status and error message if applicable
 */
async function initializeFirebase() {
  try {
    // Log more details about environment
    logger.info(`Initializing Firebase in ${process.env.NODE_ENV} environment`);
    logger.info(`Using project: ${process.env.GOOGLE_CLOUD_PROJECT || 'No project ID set'}`);
    
    // Get Firebase credentials from Secret Manager
    logger.debug('Fetching Firebase credentials from Secret Manager');
    const serviceAccount = await getSecret('firebase-credentials');
    logger.debug('Firebase credentials retrieved successfully');

    // Check if we got mock credentials (used in production when secret access fails)
    if (serviceAccount && serviceAccount._isMock === true) {
      logger.warn(`Using mock Firebase credentials: ${serviceAccount.reason}`);
      
      // Return error object instead of throwing
      return {
        success: false,
        error: `Cannot initialize Firebase with mock credentials: ${serviceAccount.reason}`
      };
    }

    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "gmail-api-test-427120.firebasestorage.app"
    });

    // Initialize services after Firebase is ready
    db = admin.firestore();
    storage = admin.storage();
    User = db.collection("Users");
    Markers = db.collection("Markers");

    logger.info("Firebase Admin SDK initialized successfully");
    return { success: true };
  } catch (error) {
    console.error('FIREBASE INITIALIZATION ERROR:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    logger.error("Failed to initialize Firebase Admin SDK", { 
      error: error.message,
      stack: error.stack,
      environment: process.env.NODE_ENV,
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });
    
    // Return error object instead of throwing
    return {
      success: false,
      error: `Firebase initialization failed: ${error.message}`
    };
  }
}

module.exports = {
  admin,
  initializeFirebase,
  // Getter functions to ensure Firebase is initialized before use
  getDb: () => db,
  getStorage: () => storage,
  getUser: () => User,
  getMarkers: () => Markers
};