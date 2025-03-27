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
 * @returns {Promise<void>}
 */
async function initializeFirebase() {
  try {
    // Get Firebase credentials from Secret Manager
    const serviceAccount = await getSecret('firebase-credentials');

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
  } catch (error) {
    logger.error("Failed to initialize Firebase Admin SDK", { error: error.message, stack: error.stack });
    process.exit(1); // Exit the process if Firebase can't be initialized
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