/**
 * API Service for handling all backend requests
 * Uses environment variables to determine base URL
 */

// Get the API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL|| '/api';

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

/**
 * Create a new problem report
 * 
 * @param {Object} problemData Data containing problem report details
 * @param {string} problemData.category Category of the problem
 * @param {string} problemData.email Email of the reporter
 * @param {string} problemData.description Description of the problem
 * @returns {Promise<any>} Promise containing the created problem report
 */
export const createProblemReport = async (problemData: { 
  category: string, 
  email: string, 
  description: string 
}) => {
  const response = await fetch(`${API_URL}/problems`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(problemData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit problem report');
  }
  
  return response.json();
};

// Add other API functions as needed