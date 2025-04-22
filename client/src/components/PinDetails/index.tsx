import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMarkers } from '../../apiService';
import { Marker } from '../../types';
import { renderFormTypeDetails } from '../../utils/formTypeUtils';
import CalendarIcon from '../../img/Calendar.svg';
import BackArrowIcon from '../../img/BackArrow.png';
import './PinDetails.css';

/**
 * PinDetails component that displays detailed information about a specific pin
 * 
 * @returns {JSX.Element} The rendered PinDetails component
 */
const PinDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pin, setPin] = useState<Marker | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPinDetails = async () => {
      try {
        setLoading(true);
        const markers = await fetchMarkers();
        const foundPin = markers.find((marker: Marker) => marker.id === id);
        
        if (foundPin) {
          setPin(foundPin);
        } else {
          setError('Pin not found');
        }
      } catch (err) {
        setError('Failed to load pin details. Please try again later.');
        console.error('Error fetching pin details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPinDetails();
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page in history
  };

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get address from location coordinates (placeholder)
  const formatAddress = (location: [number, number] | undefined) => {
    if (!location) return 'Unknown location';
    return '560 Larkin Street Southwest, Atlanta, GA 30314';
  };

  if (loading) {
    return <div className="pin-details-container">Loading pin details...</div>;
  }

  if (error || !pin) {
    return (
      <div className="pin-details-container">
        <div className="back-arrow" onClick={handleBack}>
          <img src={BackArrowIcon} alt="Back" />
        </div>
        <div className="pin-details-error">{error || 'Pin not found'}</div>
      </div>
    );
  }

  return (
    <div className="pin-details-container">
      <div className="back-arrow" onClick={handleBack}>
        <img src={BackArrowIcon} alt="Back" />
      </div>
      
      <h2 className="pin-details-title">{pin.formType}</h2>
      
      {pin.images && pin.images.length > 0 && (
        <div className="pin-details-image">
          <img src={pin.images[0]} alt={`${pin.formType} at location`} />
        </div>
      )}
      
      <div className="pin-details-item">
        <h3>Location</h3>
        <div className="pin-details-value">{formatAddress(pin.location)}</div>
      </div>
      
      <div className="pin-details-item">
        <h3>Date</h3>
        <div className="pin-details-value date-value">
          {formatDate(pin.date)}
          <span className="calendar-icon"><img src={CalendarIcon} alt="Calendar" /></span>
        </div>
      </div>
      
      {renderFormTypeDetails(pin)}
      
      {pin.notes && (
        <div className="pin-details-item">
          <h3>Notes</h3>
          <div className="pin-details-value">{pin.notes}</div>
        </div>
      )}
      
      <div className="pin-details-item">
        <h3>Mood</h3>
        <div className="pin-details-value">{pin.moodNotes}</div>
      </div>
    </div>
  );
};

export default PinDetails; 