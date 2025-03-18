import React from 'react';
import { IOSControlsProps } from './types';

/**
 * iOS-specific camera controls component
 * 
 * Uses file input with capture attribute for iOS devices.
 * On iOS, the gallery button already provides options to take photos or record videos,
 * so we don't need a separate capture button.
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
    <div className="camera-controls-container">
      {/* Gallery button for iOS - serves as the primary way to capture media */}
      <button 
        className="gallery-button ios-primary-button" 
        onClick={openGallery}
      >
        {isVideoMode ? 'Select or Record Video' : 'Select or Take Photo'}
      </button>
      
      {/* Mode toggle for iOS */}
      {allowVideo && (
        <button 
          className={`mode-toggle ${isVideoMode ? 'video-mode' : 'photo-mode'}`} 
          onClick={toggleMode}
        >
          Switch to {isVideoMode ? 'Photo' : 'Video'} Mode
        </button>
      )}
    </div>
  );
};

export default IOSControls; 