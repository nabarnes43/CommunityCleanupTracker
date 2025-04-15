import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import { Marker as MarkerType } from '../../../types';
import { newMarkerIcon, userLocationIcon } from '../mapIcons';
import MapUpdater from '../MapUpdater';
import MarkerClusterComponent from '../MarkerClusterComponent';

/**
 * Props for the MapDisplay component
 */
interface MapDisplayProps {
  userLocation: LatLngTuple | null;
  showUserMarker: boolean;
  markers: MarkerType[];
  pendingMarker: LatLngTuple | null;
  mapZoom: number;
}

/**
 * Component that displays the map elements (markers, clusters, etc)
 * 
 * @param {MapDisplayProps} props Component properties
 * @returns {JSX.Element} The rendered MapDisplay component
 */
const MapDisplay: React.FC<MapDisplayProps> = ({
  userLocation,
  showUserMarker,
  markers,
  pendingMarker,
  mapZoom
}) => {
  return (
    <>
      {/* Update map when user location changes */}
      {userLocation && (
        <MapUpdater userLocation={userLocation} mapZoom={mapZoom} />
      )}
      
      {/* Marker clusters for existing markers */}
      <MarkerClusterComponent markers={markers} />
      
      {/* Show the user location marker */}
      {userLocation && showUserMarker && (
        <Marker position={userLocation} icon={userLocationIcon}>
          <Popup>Your current location</Popup>
        </Marker>
      )}
      
      {/* Show pending marker during submission */}
      {pendingMarker && (
        <Marker position={pendingMarker} icon={newMarkerIcon}>
          <Popup>New marker being added</Popup>
        </Marker>
      )}
    </>
  );
};

export default MapDisplay; 