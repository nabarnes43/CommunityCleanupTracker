import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, MapContainerProps } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Home.css';
import PinDataForm from '../PinDataForm/index';
import MapUpdater from './MapUpdater';
import MarkerClusterComponent from './MarkerClusterComponent';
import { newMarkerIcon } from './mapIcons';
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

  /**
   * Fetch existing markers from the backend when the component mounts
   */
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await fetch('http://localhost:4000/markers');
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
   */
  const handleLocateUser = () => {
    if (navigator.geolocation) {
      setShowForm(true); // Show the form when location is found
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location: LatLngTuple = [latitude, longitude];
          setUserLocation(location);
          setMapCenter(location); // Center the map on the user's location
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  /**
   * Handle form submission for adding a new marker
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
      // Since we already have a FormData object, we should use it directly
      // First, let's add the location data
      formData.append('location', JSON.stringify({
        latitude: userLocation[0],
        longitude: userLocation[1],
      }));

      try {
        // We can now send the FormData directly to the backend
        const response = await fetch('http://localhost:4000/markers/create', {
          method: 'POST',
          body: formData, // Using the original FormData object
        });

        if (response.ok) {
          console.log('Marker saved successfully!');
          setShowForm(false); // Close the form on success
          
          // Refresh markers after adding a new one
          const markersResponse = await fetch('http://localhost:4000/markers');
          if (markersResponse.ok) {
            const data = await markersResponse.json();
            setMarkers(data);
          }
        } else {
          const errorResponse = await response.json();
          console.error('Error saving marker:', errorResponse);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      console.error('User location not available');
    }
  };

  return (
    <div className="container">
      <button className="location-button" onClick={handleLocateUser}>
        Drop Pin at My Location
      </button>

      {/* Display the PinDataForm as a modal if showForm is true */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <PinDataForm 
              onSubmit={handleFormSubmit} 
              onCancel={() => setShowForm(false)} 
            />
          </div>
        </div>
      )}

      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/#map=5/38.007/-95.844/">OpenStreetMap</a>'
          url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        <MarkerClusterComponent markers={markers} />

        {userLocation && (
          <Marker 
            position={userLocation} 
            icon={newMarkerIcon}
          >
            <Popup>You are here!</Popup>
          </Marker>
        )}
        
        {/* Component to automatically update the map's view */}
        <MapUpdater userLocation={userLocation} />
      </MapContainer>
    </div>
  );
};

export default Home; 