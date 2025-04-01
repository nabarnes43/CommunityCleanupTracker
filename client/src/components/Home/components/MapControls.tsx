import React from 'react';

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
    <div className="buttons-container flex flex-column gap-md">
      <button 
        onClick={onReportIssue}
        disabled={disabled}
        className="action-button report-button flex items-center justify-center"
        aria-label="Report an issue"
      >
        +
      </button>
    </div>
  );
};

export default MapControls; 