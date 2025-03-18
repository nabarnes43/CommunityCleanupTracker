import React from 'react';
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

  // When userLocation is updated, center the map to that location with the specified zoom level
  if (userLocation) {
    map.flyTo(userLocation, mapZoom, {
      duration: 1, // Faster animation for better user experience
    });
  }

  return null; // This component doesn't render anything itself
};

export default MapUpdater; 