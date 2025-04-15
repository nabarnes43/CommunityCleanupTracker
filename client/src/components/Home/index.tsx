import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Home.css';


// Import custom hooks
import useGeolocation from './hooks/useGeolocation';
import useMapMarkers from './hooks/useMapMarkers';
import useFormSubmission from './hooks/useFormSubmission';

// Import components
import MapDisplay from './components/MapDisplay';
import MapControls from './components/MapControls';
import FormModal from './components/FormModal';

/**
 * Home component that displays the map and allows users to add markers
 * Uses custom hooks for separation of concerns
 * 
 * @returns {JSX.Element} The rendered Home component
 */
const Home: React.FC = () => {
  // Use custom hooks
  const {
    mapCenter,
    userLocation,
    mapZoom,
    isGeolocating,
    showUserMarker,
    setShowUserMarker,
    handleLocateUser,
    resetLocationState,
    cancelGeolocation,
    DETAIL_ZOOM
  } = useGeolocation();

  const {
    markers,
    setMarkers,
    pendingMarker,
    setPendingMarker,
    isSubmitting,
    setIsSubmitting,
    addMarker
  } = useMapMarkers();

  const {
    showForm,
    setShowForm,
    handleFormSubmit,
    handleFormCancel
  } = useFormSubmission({
    userLocation,
    setIsSubmitting,
    setPendingMarker,
    addMarker,
    setMarkers,
    setShowUserMarker,
    cancelGeolocation
  });

  /**
   * Handle the Report Issue button click
   * Gets location and shows form
   */
  const handleReportIssue = async () => {
    // First show the form for better UX
    setShowForm(true);
    
    try {
      // Then try to get the user's location with detailed zoom level
      await handleLocateUser(DETAIL_ZOOM);
    } catch (error) {
      console.error('Error getting location:', error);
      // Form will be hidden in case of error by the handleLocateUser function
    }
  };

  return (
    <div className="container">
      {/* Main map component */}
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        className="map-container"
      >
        {/* Base map layer */}
        <TileLayer
        //TODO Dark Mode Map
          attribution='<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}{r}.png?access-token={accessToken}'
          accessToken='6RRKSJTP0uRGlGeLLoKokFxIxaeyoPR8Vd2n8Y3qRmVlTkcLWzaxXVDqPTBVMlf5'
        />
        
        {/* Map display component handles all markers */}
        <MapDisplay 
          userLocation={userLocation}
          showUserMarker={showUserMarker}
          markers={markers}
          pendingMarker={pendingMarker}
          mapZoom={mapZoom}
        />
      </MapContainer>
      
      {/* Map controls */}
      <MapControls 
        onReportIssue={handleReportIssue}
        disabled={isGeolocating || showForm}
      />
      
      {/* Form modal */}
      {showForm && (
        <FormModal
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default Home; 