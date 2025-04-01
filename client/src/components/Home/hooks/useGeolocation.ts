import { useState, useCallback, useRef } from 'react';
import { LatLngTuple } from 'leaflet';

/**
 * Custom hook to handle geolocation functionality
 * Manages user location state, permissions, and error handling
 * 
 * @returns Object containing location state and functions
 */
export const useGeolocation = () => {
  // Default location (Atlanta)
  const DEFAULT_LOCATION: LatLngTuple = [33.7501, -84.3885];
  const DEFAULT_ZOOM = 13;
  const DETAIL_ZOOM = 18;

  // State for location-related data
  const [mapCenter, setMapCenter] = useState<LatLngTuple>(DEFAULT_LOCATION);
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(DEFAULT_ZOOM);
  const [isGeolocating, setIsGeolocating] = useState<boolean>(false);
  const [showUserMarker, setShowUserMarker] = useState<boolean>(false);
  
  // Reference to store the current geolocation request
  const geoWatchIdRef = useRef<number | null>(null);

  /**
   * Cancel any ongoing geolocation operations
   */
  const cancelGeolocation = useCallback(() => {
    if (geoWatchIdRef.current !== null) {
      console.log('Cancelling geolocation request ID:', geoWatchIdRef.current);
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
      setIsGeolocating(false);
    }
  }, []);

  /**
   * Reset location state to defaults
   */
  const resetLocationState = useCallback(() => {
    // Cancel any ongoing geolocation first
    cancelGeolocation();
    
    setShowUserMarker(false);
    setMapZoom(DEFAULT_ZOOM);
    setMapCenter(DEFAULT_LOCATION);
    setIsGeolocating(false);
  }, [cancelGeolocation]);

  /**
   * Handle locating the user and showing the marker
   * Returns a promise that resolves when location is obtained
   */
  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. This feature requires location access to work.');
      return Promise.reject(new Error('Geolocation not supported'));
    }
    
    // Cancel any previous geolocation request
    cancelGeolocation();
    
    // Set geolocating state to true
    setIsGeolocating(true);
    
    console.log('Requesting user location...');
    
    return new Promise<LatLngTuple>((resolve, reject) => {
      // First check if we can determine permission status
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' })
          .then(permissionStatus => {
            console.log('Geolocation permission status:', permissionStatus.state);
            
            // If permission is denied, alert the user
            if (permissionStatus.state === 'denied') {
              console.error('Geolocation permission is denied');
              alert('Location access is denied. Please enable location access in your browser settings and try again.');
              
              setIsGeolocating(false);
              reject(new Error('Geolocation permission denied'));
              return;
            }
            
            // If permission is prompt, tell the user to accept the prompt
            if (permissionStatus.state === 'prompt') {
              console.log('User will be prompted for geolocation permission');
              // Continue with geolocation request below
            }
            
            // Listen for permission changes
            permissionStatus.addEventListener('change', () => {
              console.log('Geolocation permission changed to:', permissionStatus.state);
            });
            
            // Continue with geolocation request
            requestGeolocation(resolve, reject);
          })
          .catch(error => {
            console.error('Error checking geolocation permission:', error);
            // Fall back to direct geolocation request
            requestGeolocation(resolve, reject);
          });
      } else {
        // Browser doesn't support permission API, fall back to direct geolocation request
        console.log('Permissions API not supported, falling back to direct geolocation request');
        requestGeolocation(resolve, reject);
      }
    });
  }, []);

  /**
   * Internal function to handle the actual geolocation request
   */
  const requestGeolocation = (resolve: (value: LatLngTuple) => void, reject: (reason: Error) => void) => {
    console.log('Executing geolocation request...');
    
    // Try multiple times with different accuracy settings if needed
    let hasTriedLowAccuracy = false;
    
    function tryGeolocation(highAccuracy = true) {
      // Request location with appropriate accuracy option
      const watchId = navigator.geolocation.watchPosition(
        // Success callback
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Location obtained successfully:', latitude, longitude);
          
          const location: LatLngTuple = [latitude, longitude];
          
          // Store the location in state for later use
          setUserLocation(location);
          
          // Update map center
          setMapCenter(location);
          
          // Set a higher zoom level for better detail
          setMapZoom(DETAIL_ZOOM);
          
          // Show the user marker
          setShowUserMarker(true);
          
          // Log the current state for debugging
          console.log('Location state updated:', {
            userLocation: location,
            mapCenter: location,
            mapZoom: DETAIL_ZOOM,
            showUserMarker: true
          });
          
          // Reset geolocating state
          setIsGeolocating(false);
          
          // Clear the watch since we got a position
          navigator.geolocation.clearWatch(watchId);
          geoWatchIdRef.current = null;
          
          // Resolve the promise with the location
          resolve(location);
        },
        // Error callback
        (error) => {
          console.error('Error getting location:', error, 'Using high accuracy:', highAccuracy);
          
          // If high accuracy failed, try with low accuracy
          if (highAccuracy && !hasTriedLowAccuracy) {
            console.log('Retrying with low accuracy...');
            hasTriedLowAccuracy = true;
            tryGeolocation(false);
            return;
          }
          
          // Reset geolocating state
          setIsGeolocating(false);
          // Make sure user marker is hidden
          setShowUserMarker(false);
          
          // Provide specific feedback based on the error
          let errorMessage: string;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access was denied. We need location access to accurately report issues in your community. Please enable location access in your browser settings and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please try again later or check your device settings.';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get your location timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred while trying to access your location. Please try again.';
              break;
          }
          
          alert(errorMessage);
          reject(new Error(errorMessage));
        },
        // Options
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 15000 : 30000, // Longer timeout for low accuracy
          maximumAge: highAccuracy ? 0 : 60000 // Allow cached position for low accuracy
        }
      );
    }
    
    // Start with high accuracy
    tryGeolocation(true);
  };

  return {
    mapCenter,
    setMapCenter,
    userLocation,
    setUserLocation,
    mapZoom,
    setMapZoom,
    isGeolocating,
    setIsGeolocating,
    showUserMarker,
    setShowUserMarker,
    handleLocateUser,
    resetLocationState,
    cancelGeolocation,
    DEFAULT_LOCATION,
    DEFAULT_ZOOM,
    DETAIL_ZOOM
  };
};

export default useGeolocation; 