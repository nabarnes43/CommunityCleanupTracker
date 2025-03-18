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

/**
 * Initial markers for testing purposes
 */
const initialMarkers: MarkerType[] = [
  {
    location: [51.505, -0.09],
    formType: 'Test',
    popUp: 'Marker 1'
  },
  {
    location: [51.51, -0.1],
    formType: 'Test',
    popUp: 'Marker 2'
  },
  {
    location: [51.49, -0.1],
    formType: 'Test',
    popUp: 'Marker 3'
  }
];

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
  const [markers, setMarkers] = useState<MarkerType[]>(initialMarkers);
  const [pendingMarker, setPendingMarker] = useState<LatLngTuple | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // Adding a new state for zoom level to control it programmatically
  const [mapZoom, setMapZoom] = useState<number>(13);
  // Add a state to track if the geolocation is in progress
  const [isGeolocating, setIsGeolocating] = useState<boolean>(false);

  /**
   * Fetch existing markers from the backend when the component mounts
   */
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        // Use relative URL which will work with any domain
        const response = await fetch('/markers');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched markers:', data); // Debug log
          if (!Array.isArray(data)) {
            console.error('Expected array of markers, got:', typeof data);
            return;
          }
          setMarkers(data);
        } else {
          const errorData = await response.json();
          console.error('Error fetching markers:', errorData);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
  
    fetchMarkers();
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
    
    // Request location with high accuracy option
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        // Only proceed if the form is still showing (user hasn't cancelled)
        if (showForm && isGeolocating) {
          const { latitude, longitude } = position.coords;
          console.log('Location obtained:', latitude, longitude);
          const location: LatLngTuple = [latitude, longitude];
          setUserLocation(location);
          setMapCenter(location); // Center the map on the user's location
          // Set a higher zoom level for better detail
          setMapZoom(18);
        }
        // Reset geolocating state
        setIsGeolocating(false);
      },
      // Error callback
      (error) => {
        console.error('Error getting location:', error);
        
        // Close the form if we can't get location
        setShowForm(false);
        // Reset geolocating state
        setIsGeolocating(false);
        
        // Provide specific feedback based on the error
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location access was denied. We need precise location access to accurately report issues in your community. Please enable precise location access in your browser settings and try again.');
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
        enableHighAccuracy: true, // Request high accuracy for better mapping
        timeout: 10000, // 10 second timeout
        maximumAge: 0 // Don't use a cached position
      }
    );
  };

  /**
   * Handle form cancellation
   * Clears the user location pin from the map and cancels any pending geolocation requests
   */
  const handleFormCancel = () => {
    setShowForm(false);
    // Clear the user location pin when canceling
    setUserLocation(null);
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
    
    // Debug log the incoming FormData contents
    for (let pair of formData.entries()) {
      console.log('Incoming form data:', pair[0], pair[1]);
    }

    if (userLocation) {
      // Close the form immediately
      setShowForm(false);
      
      // Set the pending marker to show immediately while we save to server
      setPendingMarker(userLocation);
      setIsSubmitting(true);
      
      // Since we already have a FormData object, we should use it directly
      // First, let's add the location data
      formData.append('location', JSON.stringify({
        latitude: userLocation[0],
        longitude: userLocation[1],
      }));

      console.log('Location added to form data:', userLocation);
      
      try {
        console.log('Sending request to /markers/create');
        // We can now send the FormData directly to the backend
        // Use relative URL which will work with any domain
        const response = await fetch('/markers/create', {
          method: 'POST',
          body: formData, // Using the original FormData object
          // Do NOT set Content-Type when sending FormData
          // The browser will set it to multipart/form-data with the correct boundary
        });

        console.log('Response status:', response.status);
        
        if (response.ok) {
          console.log('Marker saved successfully!');
          
          // Refresh markers after adding a new one
          console.log('Fetching updated markers');
          const markersResponse = await fetch('/markers');
          if (markersResponse.ok) {
            const data = await markersResponse.json();
            console.log('Updated markers received:', data);
            setMarkers(data);
            
            // Keep the pending marker active so user knows which one they just added
            // But turn off submission state to indicate successful save
            setIsSubmitting(false);
            
            // After 5 seconds, clear the pending marker highlight
            setTimeout(() => {
              setPendingMarker(null);
            }, 5000);
          } else {
            console.error('Failed to fetch updated markers:', markersResponse.status);
            const errorText = await markersResponse.text();
            console.error('Error response:', errorText);
            
            // Reset submission state but keep pending marker visible
            setIsSubmitting(false);
          }
        } else {
          console.error('Error saving marker:', response.status);
          // Try to get error details
          try {
            const errorResponse = await response.json();
            console.error('Error details:', errorResponse);
          } catch (e) {
            // If JSON parsing fails, get the raw text
            const errorText = await response.text();
            console.error('Error response text:', errorText);
          }
          
          // Reset submission state but keep pending marker visible to show failure
          setIsSubmitting(false);
          
          // Alert the user about the failure
          alert('Failed to save your marker. Please try again.');
        }
      } catch (error) {
        console.error('Network or other error:', error);
        setIsSubmitting(false);
        alert('Network error occurred while saving your marker. Please check your connection and try again.');
      }
    } else {
      console.error('User location not available');
      alert('Unable to save marker: Your location is not available');
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
        {userLocation && isGeolocating && (
          <Marker 
            position={userLocation} 
            icon={newMarkerIcon}
          >
            <Popup className="custom-popup">You are here!</Popup>
          </Marker>
        )}
        
        {/* Pending marker that was just submitted */}
        {pendingMarker && (
          <Marker 
            position={pendingMarker} 
            icon={newMarkerIcon}
          >
            <Popup className="custom-popup">{isSubmitting ? 'Saving your marker...' : 'Your recently added marker!'}</Popup>
          </Marker>
        )}
        
        {/* Component to automatically update the map's view */}
        <MapUpdater 
          userLocation={isGeolocating ? userLocation : null} 
          mapZoom={mapZoom} 
        />
      </MapContainer>
    </div>
  );
};

export default Home; 