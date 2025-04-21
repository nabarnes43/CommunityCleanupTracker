import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMarkers } from '../../apiService';
import { Marker } from '../../types';
import { renderMarkerDescription } from '../../utils/formTypeUtils';
import './PinList.css';

/**
 * PinList component that displays a list of all markers/pins
 * 
 * @returns {JSX.Element} The rendered PinList component
 */
const PinList: React.FC = () => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  //TODO make addresses stored in the database rather fetched real time
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const getMarkers = async () => {
      try {
        setLoading(true);
        const data = await fetchMarkers();
        setMarkers(data);
        setError(null);
        
        // Once we have markers, get addresses for each one
        if (data.length > 0) {
          const addressPromises = data.map((marker: Marker) => 
            getAddressFromCoordinates(marker.location, marker.id || '')
          );
          
          // We'll handle address loading asynchronously, so we don't block UI rendering
          Promise.all(addressPromises).catch(err => {
            console.error('Error fetching some addresses:', err);
          });
        }
      } catch (err) {
        setError('Failed to load pins. Please try again later.');
        console.error('Error fetching markers:', err);
      } finally {
        setLoading(false);
      }
    };

    getMarkers();
  }, []);

  // Reverse geocoding function to get address from coordinates
  const getAddressFromCoordinates = async (location: [number, number], markerId: string) => {
    if (!location || !Array.isArray(location) || location.length !== 2) {
      return;
    }
    const [latitude, longitude] = location;
    // For development, use a placeholder API key
    // In production, you should use environment variables to store API keys
    const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    try {
      // Example using Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding API request failed');
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        
        // Update the addresses state with the new address
        setAddresses(prev => ({
          ...prev,
          [markerId]: address
        }));
      } else {
        // Fallback to coordinates if no address found
        setAddresses(prev => ({
          ...prev,
          [markerId]: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
        }));
      }
    } catch (error) {
      console.error('Error getting address:', error);
      
      // For development/testing, use a fallback placeholder address
      const placeholderAddresses = {
        // You can add more placeholder addresses if needed for testing
        default: '560 Larkin Street Southwest, Atlanta, GA 30314',
      };
      
      // Use different placeholder addresses or coordinates string as fallback
      setAddresses(prev => ({
        ...prev,
        [markerId]: placeholderAddresses.default || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      }));
    }
  };

  const handlePinClick = (markerId: string) => {
    navigate(`/pin/${markerId}`);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get address for display
  const getDisplayAddress = (marker: Marker) => {
    if (marker.id && addresses[marker.id]) {
      return addresses[marker.id];
    }
    
    // If we don't have an address yet, show loading or coordinates
    if (marker.location && Array.isArray(marker.location) && marker.location.length === 2) {
      const [lat, lng] = marker.location;
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
    
    return 'Unknown location';
  };

  return (
    <div className="pin-list-container">
      <h1 className="pin-list-header">Markers</h1>
      
      {loading && <div className="pin-list-loading">Loading pins...</div>}
      
      {error && <div className="pin-list-error">{error}</div>}
      
      {!loading && !error && markers.length === 0 && (
        <div className="pin-list-empty">No pins found. Create some pins on the map!</div>
      )}
      
      <div className="pin-list">
        {markers.map((marker) => (
          <div 
            key={marker.id} 
            className="pin-card"
            onClick={() => marker.id && handlePinClick(marker.id)}
          >
            <div className="pin-info">
              <h3>{getDisplayAddress(marker)}</h3>
              <p className="pin-description">
                {renderMarkerDescription(marker)}
              </p>
              <p className="pin-date">{formatDate(marker.date || '')}</p>
            </div>
            {marker.images && marker.images.length > 0 && (
              <div className="pin-image">
                <img src={marker.images[0]} alt={`${marker.formType} at location`} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinList;