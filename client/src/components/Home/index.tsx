import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Map as LeafletMap } from 'leaflet';
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
  // Store reference to the map instance
  const mapRef = useRef<LeafletMap | null>(null);
  // Track if in detailed view
  const [isDetailedView, setIsDetailedView] = useState(false);

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
    DEFAULT_ZOOM,
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

  /**
   * Handle the location button click with three modes:
   * 1. If user location not centered: Center user location at default zoom
   * 2. If user location centered at default zoom: Zoom to detailed zoom
   * 3. If user location centered at detailed zoom: Zoom out to default zoom
   */
  const handleLocationClick = async () => {
    // First ensure we have the user's location
    if (!userLocation) {
      try {
        await handleLocateUser(DEFAULT_ZOOM);
        setIsDetailedView(false);
      } catch (error) {
        console.error('Error getting location:', error);
      }
      return;
    }
    // Get the actual current map center
    let isMapCenteredOnUser = false;
    
    if (mapRef.current) {
      const actualCenter = mapRef.current.getCenter();   
      // Check if the map is centered on user location
      isMapCenteredOnUser = 
        Math.abs(userLocation[0] - actualCenter.lat) < 0.0001 && 
        Math.abs(userLocation[1] - actualCenter.lng) < 0.0001; 
    } else {
      console.log('mapRef.current is null');
    }
          
    // Mode 1: If map not centered on user location, center it at default zoom
    if (!isMapCenteredOnUser) {
      try {
        await handleLocateUser(DEFAULT_ZOOM);
        setIsDetailedView(false);
      } catch (error) {
        console.error('Error centering on location:', error);
      }
      return;
    } else if (mapZoom === DEFAULT_ZOOM) {
      // Mode 2: If at default zoom, zoom to detailed view
      handleLocateUser(DETAIL_ZOOM);
      setIsDetailedView(true);
    } else {
      // Mode 3: If at detailed zoom, zoom back to default
      handleLocateUser(DEFAULT_ZOOM);
      setIsDetailedView(false);
    }
  };

  // Store the map reference when it becomes available
  const setMapRef = (map: LeafletMap) => {
    mapRef.current = map;
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
          setMapRef={setMapRef}
        />
      </MapContainer>
      
      {/* Map controls */}
      <MapControls 
        onReportIssue={handleReportIssue}
        onLocationClick={handleLocationClick}
        disabled={isGeolocating || showForm}
        isDetailedView={isDetailedView}
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