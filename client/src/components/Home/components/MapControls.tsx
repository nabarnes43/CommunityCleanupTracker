import React from 'react';
import { customIcon } from '../mapIcons';

/**
 * Props for the MapControls component
 */
interface MapControlsProps {
  onReportIssue: () => void;
  disabled: boolean;
}

/**
 * Component that displays the map control buttons
 * 
 * @param {MapControlsProps} props Component properties
 * @returns {JSX.Element} The rendered MapControls component
 */
const MapControls: React.FC<MapControlsProps> = ({
  onReportIssue,
  disabled
}) => {
  return (
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
  );
};

export default MapControls; 