import React from 'react';
import { customIcon, navigationIcon, navigationBackgroundIcon, reportProblemIcon } from '../mapIcons';

/**
 * Props for the MapControls component
 */
interface MapControlsProps {
  onReportIssue: () => void;
  onLocationClick: () => void;
  onReportProblemClick: () => void;
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
  onReportProblemClick,
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

      <button
        onClick={onReportProblemClick}
        className="report-problem-button"
        aria-label="Report a problem with the app"
      >
        <div 
          className="report-problem-icon"
          style={{ 
            backgroundImage: `url(${reportProblemIcon.options.iconUrl})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center'
          }}
        ></div>
      </button>
    </div>
  );
};

export default MapControls; 