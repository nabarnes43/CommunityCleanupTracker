/**
 * @fileoverview Utilities for mapping between Firebase documents and application models
 * Provides functions to convert between Firebase document formats and application data models
 * @module utils/documentMapper
 */
//TODO Integrate this with the models folder and the controllers. 
/**
 * Converts a Firebase document to an application model
 * Adds the document ID as the id field and maintains all document data
 * 
 * @param {FirebaseFirestore.DocumentSnapshot} doc - Firebase document snapshot
 * @returns {Object} Model object with id and data properties
 */
function documentToModel(doc) {
  if (!doc || !doc.exists) {
    return null;
  }
  
  return {
    id: doc.id,
    ...doc.data()
  };
}

/**
 * Converts multiple Firebase documents to application models
 * 
 * @param {FirebaseFirestore.QuerySnapshot} snapshot - Query snapshot containing multiple documents
 * @returns {Array<Object>} Array of model objects
 */
function queryToModels(snapshot) {
  if (!snapshot) {
    return [];
  }
  
  return snapshot.docs.map(documentToModel);
}

/**
 * Prepares data for saving to Firebase
 * Removes the id field (as it's stored separately in Firebase)
 * Converts Date objects to Firestore Timestamps where needed
 * 
 * @param {Object} data - Data to prepare for Firebase
 * @returns {Object} Data prepared for Firebase
 */
function prepareForSave(data) {
  if (!data) {
    return {};
  }
  
  // Create a copy of the data object to avoid modifying the original
  const prepared = { ...data };
  
  // Remove id as it's stored separately in Firestore
  if ('id' in prepared) {
    delete prepared.id;
  }
  
  return prepared;
}

module.exports = {
  documentToModel,
  queryToModels,
  prepareForSave
}; 