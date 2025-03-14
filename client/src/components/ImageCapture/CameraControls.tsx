import React from 'react';
import { CameraControlsProps } from './types';

/**
 * Camera controls component for non-iOS platforms
 * 
 * Provides controls for camera operations on Android/Web/Desktop
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
  return (
    <>
      {/* Non-iOS controls (Android/Web/Mac) */}
      {!isCameraActive ? (
        <button className="camera-button" onClick={toggleCamera}>
          {isVideoMode ? 'Open Camera for Video' : captureButtonText}
        </button>
      ) : (
        <button
          className={`capture-button ${isRecording ? 'recording' : ''}`}
          onClick={handleVideoAction}
        >
          {isVideoMode
            ? isRecording
              ? 'Stop Recording'
              : 'Start Recording'
            : 'Take Photo'}
        </button>
      )}
      
      {/* Gallery button for non-iOS */}
      <button className="gallery-button" onClick={openFileSelection}>
        {galleryButtonText}
      </button>
      
      {/* Mode toggle for non-iOS */}
      {allowVideo && (
        <button 
          className="mode-toggle" 
          onClick={toggleMode} 
          disabled={isCameraActive && isRecording}
        >
          Switch to {isVideoMode ? 'Photo' : 'Video'} Mode
        </button>
      )}
      
      {/* Close camera button */}
      {isCameraActive && (
        <button 
          className="stop-camera-button"
          onClick={stopCamera}
          disabled={isRecording}
        >
          Close Camera
        </button>
      )}
    </>
  );
};

export default CameraControls; 