import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, MapContainerProps } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Home.css';
import PinDataForm from '../PinDataForm/index';
import MapUpdater from './MapUpdater';
import MarkerClusterComponent from './MarkerClusterComponent';
import { newMarkerIcon, customIcon } from './mapIcons';
import { Marker as MarkerType } from '../../types';
import { LatLngTuple } from 'leaflet';
import { fetchMarkers, createMarker } from '../../apiService';
/**
 * Home component that displays the map and allows users to add markers
 * 
 * @returns {JSX.Element} The rendered Home component
 */
const Home: React.FC = () => {
  // State for map center, user location, form visibility, and markers
  const [mapCenter, setMapCenter] = useState<LatLngTuple>([33.7501, -84.3885]);
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [pendingMarker, setPendingMarker] = useState<LatLngTuple | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // Adding a new state for zoom level to control it programmatically
  const [mapZoom, setMapZoom] = useState<number>(13);
  // Add a state to track if the geolocation is in progress
  const [isGeolocating, setIsGeolocating] = useState<boolean>(false);
  // Add a state to track if user location marker should be shown
  const [showUserMarker, setShowUserMarker] = useState<boolean>(false);

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
   * Handle locating the user and showing the form
   * Only show permission alert if geolocation is unavailable or denied
   */
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. This feature requires location access to work.');
      return;
    }
    
    // Show form immediately to improve perceived performance
    setShowForm(true);
    // Set geolocating state to true
    setIsGeolocating(true);
    
    console.log('Requesting user location...');
    
    // First check if we can determine permission status
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(permissionStatus => {
          console.log('Geolocation permission status:', permissionStatus.state);
          
          // If permission is denied, alert the user
          if (permissionStatus.state === 'denied') {
            console.error('Geolocation permission is denied');
            alert('Location access is denied. Please enable location access in your browser settings and try again.');
            
            setShowForm(false);
            setIsGeolocating(false);
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
          requestGeolocation();
        })
        .catch(error => {
          console.error('Error checking geolocation permission:', error);
          // Fall back to direct geolocation request
          requestGeolocation();
        });
    } else {
      // Browser doesn't support permission API, fall back to direct geolocation request
      console.log('Permissions API not supported, falling back to direct geolocation request');
      requestGeolocation();
    }
    
    function requestGeolocation() {
      console.log('Executing geolocation request...');
      
      // Try multiple times with different accuracy settings if needed
      let hasTriedLowAccuracy = false;
      
      function tryGeolocation(highAccuracy = true) {
        // Request location with appropriate accuracy option
        navigator.geolocation.getCurrentPosition(
          // Success callback
          (position) => {
            // Only proceed if the form is still showing (user hasn't cancelled)
            if (showForm) {
              const { latitude, longitude } = position.coords;
              console.log('Location obtained successfully:', latitude, longitude);
              
              const location: LatLngTuple = [latitude, longitude];
              
              // Store the location in state for later use
              setUserLocation(location);
              
              // Update map center
              setMapCenter(location);
              
              // Set a higher zoom level for better detail
              setMapZoom(18);
              
              // Show the user marker
              setShowUserMarker(true);
              
              // Log the current state for debugging
              console.log('Location state updated:', {
                userLocation: location,
                mapCenter: location,
                mapZoom: 18,
                showUserMarker: true
              });
            } else {
              console.log('Form was closed before location was obtained');
            }
            
            // Reset geolocating state
            setIsGeolocating(false);
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
            
            // Close the form if we can't get location after all attempts
            setShowForm(false);
            // Reset geolocating state
            setIsGeolocating(false);
            // Make sure user marker is hidden
            setShowUserMarker(false);
            
            // Provide specific feedback based on the error
            switch (error.code) {
              case error.PERMISSION_DENIED:
                alert('Location access was denied. We need location access to accurately report issues in your community. Please enable location access in your browser settings and try again.');
                break;
              case error.POSITION_UNAVAILABLE:
                alert('Location information is unavailable. Please try again later or check your device settings.');
                break;
              case error.TIMEOUT:
                alert('The request to get your location timed out. Please try again.');
                break;
              default:
                alert('An unknown error occurred while trying to access your location. Please try again.');
                break;
            }
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
    }
  };

  /**
   * Handle form cancellation
   * Clears the user location pin from the map and cancels any pending geolocation requests
   */
  const handleFormCancel = () => {
    setShowForm(false);
    // Hide the user location marker when canceling
    setShowUserMarker(false);
    // Reset map zoom to default
    setMapZoom(13);
    // Reset map center to default
    setMapCenter([33.7501, -84.3885]);
    
    // Indicate that we should stop any pending geolocation processes
    setIsGeolocating(false);
    
    // Clear any pending markers
    setPendingMarker(null);
  };

  /**
   * Handle form submission for adding a new marker
   * Immediately closes the form and shows a pending marker
   * 
   * @param {FormData} formData - The form data for the new marker
   */
  const handleFormSubmit = async (formData: FormData) => {
    console.log('Home Form submitted'); 
    console.log('Current user location state:', userLocation);
    console.log('Show user marker state:', showUserMarker);
    
    // Debug log the incoming FormData contents
    for (let pair of formData.entries()) {
      console.log('Incoming form data:', pair[0], pair[1]);
    }

    // Let's double-check if we can get a fresh location if needed
    if (!userLocation) {
      console.log('No user location found in state, attempting to get a fresh location');
      
      try {
        // Try to get a fresh location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        });
        
        const { latitude, longitude } = position.coords;
        console.log('Fresh location obtained:', latitude, longitude);
        const location: LatLngTuple = [latitude, longitude];
        setUserLocation(location);
        
        // Now proceed with the submission using the fresh location
        await submitFormWithLocation(formData, location);
        
      } catch (error) {
        console.error('Error getting fresh location:', error);
        alert('Unable to save marker: Your location is not available. Please try clicking the pin button again to re-establish your location.');
      }
    } else {
      // Use the existing location
      console.log('Using existing user location:', userLocation);
      await submitFormWithLocation(formData, userLocation);
    }
  };

  /**
   * Helper function to submit the form with a valid location
   * 
   * @param {FormData} formData - The form data to submit
   * @param {LatLngTuple} location - The location to use for the marker
   */
  const submitFormWithLocation = async (formData: FormData, location: LatLngTuple) => {
    // Close the form immediately
    setShowForm(false);
    
    // Set the pending marker to show immediately while we save to server
    setPendingMarker(location);
    setIsSubmitting(true);
    
    try {
      // Clone the FormData to avoid mutating the original
      const formDataToSend = new FormData();
      
      // Copy all entries from the original formData
      for (let pair of formData.entries()) {
        formDataToSend.append(pair[0], pair[1]);
      }
      
      // Add the location data
      formDataToSend.append('location', JSON.stringify({
        latitude: location[0],
        longitude: location[1],
      }));

      console.log('Location added to form data:', location);
      console.log('Sending request to /markers/create');
      
      // Use the API service to create the marker
      await createMarker(formDataToSend);
      console.log('Marker saved successfully!');
      
      // Refresh markers after adding a new one
      console.log('Fetching updated markers');
      const updatedMarkers = await fetchMarkers();
      console.log('Updated markers received:', updatedMarkers);
      setMarkers(updatedMarkers);
      
      // Keep the pending marker active so user knows which one they just added
      // But turn off submission state to indicate successful save
      setIsSubmitting(false);
      
      // After 5 seconds, clear the pending marker highlight
      setTimeout(() => {
        setPendingMarker(null);
      }, 5000);
      
    } catch (error) {
      console.error('Error saving marker:', error);
      setIsSubmitting(false);
      alert('Failed to save your marker. Please try again.');
    }
  };

  /**
   * Handler for the Report Issue button
   * Currently just shows an alert as a placeholder for future functionality
   */
  const handleReportIssue = () => {
    alert('Report Issue functionality will be implemented in a future update.');
  };

  return (
    <div className="container">
      {/* Action buttons in a container with flexbox layout */}
      <div className="buttons-container">
        <button 
          className="action-button pin-button" 
          onClick={handleLocateUser} 
          title="Drop Pin at My Location"
          type="button"
        >
          <img src={customIcon.options.iconUrl} alt="Drop Pin" style={{ width: '80%', height: '80%' }} />
        </button>
        
        <button 
          className="action-button report-button" 
          onClick={handleReportIssue} 
          title="Report Issue"
          type="button"
        >
          !
        </button>
      </div>

      {/* Display the PinDataForm as a modal if showForm is true */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <button className="modal-cancel-btn" onClick={handleFormCancel}>
              ×
            </button>
            <PinDataForm 
              onSubmit={handleFormSubmit} 
              onCancel={handleFormCancel} 
            />
          </div>
        </div>
      )}

      {/* Debug information - hidden in production
      {process.env.NODE_ENV !== 'production' && (
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000, background: 'rgba(255,255,255,0.8)', padding: '10px', fontSize: '12px', maxWidth: '300px', overflow: 'auto', maxHeight: '200px' }}>
          <strong>Debug Info:</strong><br/>
          User Location: {userLocation ? `[${userLocation[0].toFixed(5)}, ${userLocation[1].toFixed(5)}]` : 'null'}<br/>
          Show User Marker: {showUserMarker ? 'true' : 'false'}<br/>
          Is Geolocating: {isGeolocating ? 'true' : 'false'}<br/>
          Pending Marker: {pendingMarker ? 'true' : 'false'}<br/>
          Map Zoom: {mapZoom}
        </div>
      )} */}

      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/#map=5/38.007/-95.844/">OpenStreetMap</a>'
          url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        <MarkerClusterComponent markers={markers} />

        {/* User's current location marker */}
        {userLocation && showUserMarker && (
          <Marker 
            position={userLocation} 
            icon={newMarkerIcon}
            key={`user-marker-${userLocation[0]}-${userLocation[1]}`}
          >
            <Popup className="custom-popup">
              <div>
                <strong>You are here!</strong><br/>
                Latitude: {userLocation[0].toFixed(6)}<br/>
                Longitude: {userLocation[1].toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Pending marker that was just submitted */}
        {pendingMarker && (
          <Marker 
            position={pendingMarker} 
            icon={newMarkerIcon}
            key={`pending-marker-${pendingMarker[0]}-${pendingMarker[1]}`}
          >
            <Popup className="custom-popup">
              <div>
                {isSubmitting ? 'Saving your marker...' : 'Your recently added marker!'}<br/>
                Latitude: {pendingMarker[0].toFixed(6)}<br/>
                Longitude: {pendingMarker[1].toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Component to automatically update the map's view */}
        <MapUpdater 
          userLocation={userLocation} 
          mapZoom={mapZoom} 
        />
      </MapContainer>
    </div>
  );
};

export default Home; 