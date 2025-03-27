/**
 * API Service for handling all backend requests
 * Uses environment variables to determine base URL
 */

// Get the API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL;

/**
 * Fetch markers from the backend
 * 
 * @returns {Promise<any>} Promise containing marker data
 */
export const fetchMarkers = async () => {
  const response = await fetch(`${API_URL}/markers`);
  if (!response.ok) {
    throw new Error(`Error fetching markers: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Create a new marker
 * 
 * @param {FormData} formData Form data containing marker details
 * @returns {Promise<any>} Promise containing the created marker
 */
export const createMarker = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/markers/create`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type when sending FormData
  });
  
  if (!response.ok) {
    throw new Error(`Error creating marker: ${response.statusText}`);
  }
  
  return response.json();
};

// Add other API functions as needed