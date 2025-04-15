import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { MapUpdaterProps } from '../../types';
import { LatLngTuple } from 'leaflet';

/**
 * Component that updates the map view when the user's location changes
 * 
 * @param {MapUpdaterProps} props - Component props
 * @param {[number, number] | null} props.userLocation - User's location as [latitude, longitude] or null
 * @param {number} [props.mapZoom=18] - Zoom level for the map when centered on user location
 * @returns {null} This component doesn't render anything
 */
const MapUpdater: React.FC<MapUpdaterProps> = ({ userLocation, mapZoom = 18 }) => {
  const map = useMap();
  const previousLocation = useRef<LatLngTuple | null>(null);

  // Use useEffect to handle map updates when userLocation changes
  useEffect(() => {
    // Check if we have a valid user location
    if (!userLocation) {
      console.log('MapUpdater: No user location provided');
      return;
    }
    
    // Validate the user location format
    if (!Array.isArray(userLocation) || userLocation.length !== 2 || 
        typeof userLocation[0] !== 'number' || typeof userLocation[1] !== 'number') {
      console.error('MapUpdater: Invalid user location format', userLocation);
      return;
    }
      
    console.log('MapUpdater: Updating map view to:', userLocation, 'zoom:', mapZoom);
    
    try {
      map.flyTo(userLocation, mapZoom, {
        duration: 1, // Faster animation for better user experience
      });
      
      // Update the previous location reference
      previousLocation.current = userLocation;
      console.log('MapUpdater: Map view updated successfully');
    } catch (error) {
      console.error('MapUpdater: Error updating map view:', error);
    }

  }, [userLocation, mapZoom, map]); // Dependencies for the effect

  return null; // This component doesn't render anything itself
};

export default MapUpdater; 