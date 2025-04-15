import React from 'react';
import { customIcon, navigationIcon, navigationBackgroundIcon } from '../mapIcons';

/**
 * Props for the MapControls component
 */
interface MapControlsProps {
  onReportIssue: () => void;
  onLocationClick: () => void;
  disabled: boolean;
  isDetailedView: boolean;
}

/**
 * Component that displays the map control buttons
 * 
 * @param {MapControlsProps} props Component properties
 * @returns {JSX.Element} The rendered MapControls component
 */
const MapControls: React.FC<MapControlsProps> = ({
  onReportIssue,
  onLocationClick,
  disabled,
  isDetailedView
}) => {
  return (
    <div className="map-controls">
      <button 
        onClick={onReportIssue}
        disabled={disabled}
        className="pin-button"
        aria-label="Drop a Pin Report an issue"
      >
        <div 
          className="pin-icon"
          style={{ 
            backgroundImage: `url(${customIcon.options.iconUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
      </button>
      
      <button
        onClick={onLocationClick}
        disabled={disabled}
        className="location-button"
        aria-label="Toggle location tracking"
      >
        <div 
          className={`location-icon ${isDetailedView ? 'detailed' : ''}`}
          style={{ 
            backgroundImage: `url(${isDetailedView ? navigationIcon.options.iconUrl : navigationBackgroundIcon.options.iconUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
      </button>
    </div>
  );
};

export default MapControls; 