import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { MapUpdaterProps } from '../../types';

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

  // Use useEffect to handle map updates when userLocation changes
  useEffect(() => {
    // Only update the map if userLocation is available
    if (userLocation) {
      map.flyTo(userLocation, mapZoom, {
        duration: 1, // Faster animation for better user experience
      });
    }
  }, [userLocation, mapZoom, map]); // Dependencies for the effect

  return null; // This component doesn't render anything itself
};

export default MapUpdater; 