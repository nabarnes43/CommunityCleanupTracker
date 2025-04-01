import React, { useState, useCallback } from 'react';
import { LatLngTuple } from 'leaflet';
import { createMarker } from '../../../apiService';
import { Marker as MarkerType } from '../../../types';

/**
 * Props for the useFormSubmission hook
 */
interface UseFormSubmissionProps {
  userLocation: LatLngTuple | null;
  setIsSubmitting: (value: boolean) => void;
  resetLocationState: () => void;
  setPendingMarker: (marker: LatLngTuple | null) => void;
  addMarker: (marker: MarkerType) => void;
  setMarkers: React.Dispatch<React.SetStateAction<MarkerType[]>>;
  setShowUserMarker: (show: boolean) => void;
  cancelGeolocation: () => void;
}

/**
 * Custom hook to handle form submission functionality
 * Manages form state and submission logic
 * 
 * @param {UseFormSubmissionProps} props Properties needed for form submission
 * @returns Object containing form state and functions
 */
export const useFormSubmission = ({
  userLocation,
  setIsSubmitting,
  resetLocationState,
  setPendingMarker,
  addMarker,
  setMarkers,
  setShowUserMarker,
  cancelGeolocation
}: UseFormSubmissionProps) => {
  // State for form visibility
  const [showForm, setShowForm] = useState<boolean>(false);

  /**
   * Handle form cancellation
   * Clears the user location pin from the map and cancels any ongoing geolocation
   */
  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setShowUserMarker(false);
    // Cancel any in-progress geolocation
    cancelGeolocation();
    resetLocationState();
    setPendingMarker(null);
  }, [resetLocationState, setPendingMarker, setShowUserMarker, cancelGeolocation]);

  /**
   * Handle form submission for adding a new marker
   * 
   * @param {FormData} formData - The form data for the new marker
   */
  const handleFormSubmit = useCallback(async (formData: FormData) => {
    console.log('Form submitted');
    
    if (!userLocation) {
      console.error('No user location available');
      alert('Could not determine your location. Please try again.');
      return;
    }
    
    // Debug log the incoming FormData contents
    for (let pair of formData.entries()) {
      console.log('Incoming form data:', pair[0], pair[1]);
    }

    try {
      await submitFormWithLocation(formData, userLocation);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit the form. Please try again.');
    }
  }, [userLocation]);

  /**
   * Submit the form with the provided location
   * 
   * @param {FormData} formData - The form data
   * @param {LatLngTuple} location - The location for the marker
   */
  const submitFormWithLocation = async (formData: FormData, location: LatLngTuple) => {
    try {
      setIsSubmitting(true);
      
      // Format location as an object with latitude and longitude
      const locationObject = {
        latitude: location[0],
        longitude: location[1]
      };
      
      // Add location to form data as a JSON string
      formData.append('location', JSON.stringify(locationObject));
      
      console.log('Submitting form with location:', location);
      
      // Set this location as a pending marker while we save
      setPendingMarker(location);
      
      // Send the data to the server
      const serverResponse = await createMarker(formData);
      console.log('Server response:', serverResponse);
      
      // Once the server responds, we can clear the pending marker
      setPendingMarker(null);
      
      // If the server returned a marker ID, fetch the complete marker data
      if (serverResponse && serverResponse.id) {
        try {
          // Import the fetchMarkers function directly here
          const { fetchMarkers } = await import('../../../apiService');
          
          // Fetch all markers to get the fresh data
          const updatedMarkers = await fetchMarkers();
          
          // Set the new markers in state
          setMarkers(updatedMarkers);
          
          // Store the newly created marker ID in session storage
          // This will be used by the MarkerClusterComponent to highlight it
          sessionStorage.setItem('newMarkerID', serverResponse.id);
          
          // After 5 seconds, remove the newMarkerID from session storage
          setTimeout(() => {
            sessionStorage.removeItem('newMarkerID');
            console.log('Removed newMarkerID from session storage after 5 seconds');
          }, 5000); // 5 seconds
        } catch (fetchError) {
          console.error('Error fetching updated marker data:', fetchError);
        }
      }
      
      // Clean up
      setShowForm(false);
      resetLocationState();
      
      console.log('Form submitted successfully');
    } catch (error) {
      console.error('Error creating marker:', error);
      
      // Clear the pending marker on error
      setPendingMarker(null);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Convenience method to show the form and get user location in one step
   */
  const showFormAndGetLocation = useCallback(() => {
    setShowForm(true);
  }, []);

  return {
    showForm,
    setShowForm,
    handleFormCancel,
    handleFormSubmit,
    showFormAndGetLocation
  };
};

export default useFormSubmission; 