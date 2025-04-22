import L from 'leaflet';

/**
 * Custom icon for map markers
 * Uses the standard Leaflet div icon with custom styling
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
  iconSize: [50, 50],
  zIndexOffset: 1000
});

/**
 * Navigation icon for location tracking
 */
export const navigationIcon = new L.Icon({
  iconUrl: require('../../img/Navigation.png'),
});

/**
 * Navigation icon for location tracking
 */
export const navigationBackgroundIcon = new L.Icon({
  iconUrl: require('../../img/NavigationBackground.png'),
});

/**
 * Circle icon with white border and dark green background
 * Uses Leaflet's divIcon for custom styling through CSS
 * Includes a pulsing animation and high z-index to display above other map elements
 */
export const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <style>
      @keyframes pulse {
        0% { transform: scale(0.8); }
        50% { transform: scale(1.1); }
        100% { transform: scale(0.8); }
      }
      .pulse-circle-wrapper {
        width: 100%;
        height: 100%;
        background-color: #eae0d5;
        border-radius: 50% !important;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .pulse-circle {
        background-color: #6c6063;
        border-radius: 50%;
        width: 80%;
        height: 80%;
        animation: pulse 3s infinite ease-in-out;
      }
    </style>
    <div class="pulse-circle-wrapper">
      <div class="pulse-circle"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
}); 