import { useState, useEffect } from 'react';
import { LatLngTuple } from 'leaflet';
import { Marker as MarkerType } from '../../../types';
import { fetchMarkers } from '../../../apiService';

/**
 * Custom hook to handle map markers functionality
 * Manages fetching markers, marker state, and pending markers
 * 
 * @returns Object containing marker state and functions
 */
export const useMapMarkers = () => {
  // State for markers
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [pendingMarker, setPendingMarker] = useState<LatLngTuple | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Fetch existing markers from the backend when the component mounts
   */
  useEffect(() => {
    const fetchMarkersData = async () => {
      try {
        const data = await fetchMarkers();
        console.log('Fetched markers:', data);
        if (!Array.isArray(data)) {
          console.error('Expected array of markers, got:', typeof data);
          return;
        }
        setMarkers(data);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
  
    fetchMarkersData();
  }, []);

  /**
   * Add a new marker to the collection
   * 
   * @param {MarkerType} marker The marker to add
   */
  const addMarker = (marker: MarkerType) => {
    if (marker) {
      console.log('Adding marker to map:', marker);
      setMarkers(prevMarkers => [...prevMarkers, marker]);
    } else {
      console.error('Cannot add null marker');
    }
  };

  return {
    markers,
    setMarkers,
    pendingMarker,
    setPendingMarker,
    isSubmitting,
    setIsSubmitting,
    addMarker
  };
};

export default useMapMarkers; 