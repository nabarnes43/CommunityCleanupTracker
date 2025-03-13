import React from 'react';
import { useMap } from 'react-leaflet';
import { MapUpdaterProps } from '../../types';

/**
 * Component that updates the map view when the user's location changes
 * 
 * @param {MapUpdaterProps} props - Component props
 * @param {[number, number] | null} props.userLocation - User's location as [latitude, longitude] or null
 * @returns {null} This component doesn't render anything
 */
const MapUpdater: React.FC<MapUpdaterProps> = ({ userLocation }) => {
  const map = useMap();

  // When userLocation is updated, center the map to that location
  if (userLocation) {
    map.flyTo(userLocation, 13, {
      duration: 3,
    }); // Set view to user's location with zoom level 13
  }

  return null; // This component doesn't render anything itself
};

export default MapUpdater; 