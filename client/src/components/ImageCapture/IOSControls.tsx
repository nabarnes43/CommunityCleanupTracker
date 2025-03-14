import React from 'react';
import { IOSControlsProps } from './types';

/**
 * iOS-specific camera controls component
 * 
 * Uses file input with capture attribute for iOS devices
 * 
 * @param {IOSControlsProps} props - Component props
 * @returns {JSX.Element} The rendered iOS controls
 */
const IOSControls: React.FC<IOSControlsProps> = ({
  isVideoMode,
  captureButtonText,
  galleryButtonText,
  allowVideo,
  openFileSelection,
  toggleMode,
  fileInputRef
}) => {
  /**
   * Opens gallery selection by removing the capture attribute
   */
  const openGallery = () => {
    if (fileInputRef.current) {
      console.log('Opening gallery selection on iOS');
      // Remove capture attribute for gallery selection
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  return (
    <>
      {/* iOS uses file input with capture attribute */}
      <button
        className="ios-capture-button"
        onClick={openFileSelection}
      >
        {isVideoMode ? 'Record Video' : captureButtonText}
      </button>
      
      {/* Gallery button for iOS */}
      <button 
        className="gallery-button" 
        onClick={openGallery}
      >
        {galleryButtonText}
      </button>
      
      {/* Mode toggle for iOS */}
      {allowVideo && (
        <button className="mode-toggle" onClick={toggleMode}>
          Switch to {isVideoMode ? 'Photo' : 'Video'} Mode
        </button>
      )}
    </>
  );
};

export default IOSControls; 