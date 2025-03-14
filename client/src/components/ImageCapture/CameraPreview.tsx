import React, { useEffect } from 'react';
import { CameraPreviewProps } from './types';
import { formatTime } from './utils';

/**
 * Camera preview component that displays the live camera feed
 * 
 * @param {CameraPreviewProps} props - Component props
 * @returns {JSX.Element} The rendered camera preview
 */
const CameraPreview: React.FC<CameraPreviewProps> = ({
  stream,
  isRecording,
  recordingTime,
  videoRef,
  onError
}) => {
  // Set up video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('Setting up video element with stream');
      
      const videoElement = videoRef.current;
      
      // Set up event listeners
      videoElement.onloadedmetadata = () => {
        console.log('Video metadata loaded:', videoElement.videoWidth, 'x', videoElement.videoHeight);
      };
      
      videoElement.onloadeddata = () => {
        console.log('Video data loaded, dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
        
        // If we get a stream with zero dimensions, try to play the video explicitly
        if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
          console.log('Video has zero dimensions after loading, trying to play explicitly');
          videoElement.play().catch(e => console.error('Could not play video:', e));
        }
      };
      
      videoElement.onerror = (e) => {
        console.error('Video element error:', e);
        onError('Error initializing camera preview');
      };
      
      // Assign the media stream
      videoElement.srcObject = stream;
      
      // Try to play the video
      videoElement.play().catch(playError => {
        console.warn('Could not automatically play the video:', playError);
      });
      
      // Log camera information for debugging
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        console.log('Using camera:', videoTracks[0].label);
        console.log('Camera settings:', videoTracks[0].getSettings());
        
        // Monitor track state changes
        videoTracks[0].onended = () => {
          console.log('Camera track ended');
          onError('Camera connection lost. Please try again.');
        };
      }
    }
  }, [stream, videoRef, onError]);

  return (
    <div className="camera-container">
      {/* Camera video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-preview"
        onLoadedData={() => {
          console.log('Camera stream loaded, readyState:', videoRef.current?.readyState);
          console.log('Dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
        }}
        onError={() => {
          console.error('Video error event');
          onError('Error loading video stream');
        }}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23333'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' fill='%23fff'%3EInitializing camera...%3C/text%3E%3C/svg%3E"
      />
      
      {/* Camera readiness indicator */}
      <div className="camera-status">
        {videoRef.current && videoRef.current.readyState < 2 && (
          <div className="camera-loading">Initializing camera...</div>
        )}
      </div>
      
      {/* Recording indicator and timer */}
      {isRecording && (
        <div className="recording-indicator">
          <span className="recording-dot"></span>
          <span className="recording-time">{formatTime(recordingTime)}</span>
        </div>
      )}
    </div>
  );
};

export default CameraPreview; 