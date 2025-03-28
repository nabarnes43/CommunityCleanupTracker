import L from 'leaflet';

/**
 * Custom icon for existing markers on the map
 */
export const customIcon = new L.Icon({
  iconUrl: require('../../img/marker.png'),
  iconSize: [38, 38]
});

/**
 * Custom icon for new markers being placed on the map
 */
export const newMarkerIcon = new L.Icon({
  iconUrl: require('../../img/newMarker.png'),
  iconSize: [50, 50]
}); 