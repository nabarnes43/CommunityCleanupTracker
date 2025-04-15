import { useState, useCallback, useRef, useEffect } from 'react';
import { LatLngTuple } from 'leaflet';

/**
 * Custom hook for handling map geolocation features
 * @returns Geolocation state and functions
 */
export const useGeolocation = () => {
  // Constants
  const DEFAULT_LOCATION: LatLngTuple = [33.7501, -84.3885];
  const DEFAULT_ZOOM = 13;
  const DETAIL_ZOOM = 18;

  // State
  const [mapCenter, setMapCenter] = useState<LatLngTuple>(DEFAULT_LOCATION);
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(DEFAULT_ZOOM);
  const [isGeolocating, setIsGeolocating] = useState<boolean>(false);
  const [showUserMarker, setShowUserMarker] = useState<boolean>(false);
  
  // Reference to geolocation watch ID
  const geoWatchIdRef = useRef<number | null>(null);

  /**
   * Cancel active geolocation watch
   */
  const cancelGeolocation = useCallback(() => {
    if (geoWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
      setIsGeolocating(false);
    }
  }, []);

  /**
   * Reset map to default state
   */
  const resetLocationState = useCallback(() => {
    cancelGeolocation();
    setMapZoom(DEFAULT_ZOOM);
    setMapCenter(DEFAULT_LOCATION);
    setIsGeolocating(false);
  }, [cancelGeolocation]);

  /**
   * Get user's location, center map on it, and zoom in
   * @param zoomLevel The zoom level to set (defaults to DETAIL_ZOOM)
   * @returns Promise resolving to the found location
   */
  const handleLocateUser = useCallback((zoomLevel = DETAIL_ZOOM) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return Promise.reject(new Error('Geolocation not supported'));
    }
    
    cancelGeolocation();
    setIsGeolocating(true);
    
    return new Promise<LatLngTuple>((resolve, reject) => {
      const watchId = navigator.geolocation.watchPosition(
        // Success handler
        (position) => {
          const { latitude, longitude } = position.coords;
          const location: LatLngTuple = [latitude, longitude];
          
          // Update all state
          setUserLocation(location);
          setShowUserMarker(true);
          setMapCenter(location);
          setMapZoom(zoomLevel);
          setIsGeolocating(false);
          
          // Clean up
          if (geoWatchIdRef.current !== null) {
            navigator.geolocation.clearWatch(geoWatchIdRef.current);
            geoWatchIdRef.current = null;
          }
          
          resolve(location);
        },
        // Error handler
        (error) => {
          setIsGeolocating(false);
          
          let message: string;
          switch(error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access was denied. Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable. Please try again later.';
              break;
            case error.TIMEOUT:
              message = 'The request to get your location timed out. Please try again.';
              break;
            default:
              message = 'An unknown error occurred while trying to access your location.';
          }
          
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
      
      geoWatchIdRef.current = watchId;
    });
  }, [cancelGeolocation]);

  
  // Get user location on component mount with default zoom
  useEffect(() => {
    handleLocateUser(DEFAULT_ZOOM).catch(() => {
      console.log('Could not get initial location');
    });
  }, [handleLocateUser]);

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