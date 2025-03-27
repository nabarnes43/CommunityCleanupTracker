import React from 'react';
import { CameraControlsProps } from './types';
import { isMobile } from './utils';

/**
 * Camera controls component for non-iOS platforms
 * 
 * Provides controls for camera operations on Android/Web/Desktop
 * with device-specific optimizations:
 * - On mobile: Gallery button handles both selection and capture
 * - On desktop: Separate buttons for camera control and gallery
 * 
 * @param {CameraControlsProps} props - Component props
 * @returns {JSX.Element} The rendered camera controls
 */
const CameraControls: React.FC<CameraControlsProps> = ({
  isCameraActive,
  isRecording,
  isVideoMode,
  allowVideo,
  captureButtonText,
  galleryButtonText,
  toggleCamera,
  handleVideoAction,
  toggleMode,
  stopCamera,
  openFileSelection
}) => {
  // Detect if current device is mobile
  const isMobileDevice = isMobile();

  // Determine appropriate button text based on mode
  const getActionButtonText = () => {
    if (isVideoMode) {
      return isRecording ? 'Stop Recording' : 'Start Recording';
    }
    return 'Take Photo';
  };

  return (
    <div className="camera-controls-container">
      {/* Camera activation button - only show on desktop when camera is inactive */}
      {!isCameraActive ? (
        <>
          {/* For desktop, always show the camera button */}
          {!isMobileDevice && (
            <button 
              className="camera-button" 
              onClick={toggleCamera}
            >
              {isVideoMode ? 'Open Camera for Video' : captureButtonText}
            </button>
          )}
          
          {/* For mobile, show enhanced gallery button */}
          {isMobileDevice && (
            <button 
              className="gallery-button mobile-primary-button" 
              onClick={openFileSelection}
            >
              {isVideoMode ? 'Select or Record Video' : 'Select or Take Photo'}
            </button>
          )}
        </>
      ) : (
        <button
          className={`capture-button ${isRecording ? 'recording' : ''}`}
          onClick={handleVideoAction}
        >
          {getActionButtonText()}
        </button>
      )}
      
      {/* 
        Gallery button for all platforms
        Not needed for mobile when camera is inactive (handled above)
      */}
      {(!isMobileDevice || isCameraActive) && (
        <button 
          className="gallery-button" 
          onClick={openFileSelection}
        >
          {galleryButtonText}
        </button>
      )}
      
      {/* Mode toggle for all platforms */}
      {allowVideo && (
        <button 
          className={`mode-toggle ${isVideoMode ? 'video-mode' : 'photo-mode'}`}
          onClick={toggleMode} 
          disabled={isCameraActive && isRecording}
        >
          Switch to {isVideoMode ? 'Photo' : 'Video'} Mode
        </button>
      )}
    </div>
  );
};

export default CameraControls; 