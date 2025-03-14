import React, { useState } from 'react';
import ImageCapture from './index';
import './ImageCaptureDemo.css';

/**
 * Demo component for showcasing the ImageCapture component
 * 
 * This component demonstrates:
 * 1. How to use the ImageCapture component
 * 2. How to handle the captured images and videos
 * 3. How to configure the component with different options
 * 
 * @returns {JSX.Element} The rendered ImageCaptureDemo component
 */
const ImageCaptureDemo: React.FC = () => {
  // State to store the captured media files
  const [capturedFiles, setCapturedFiles] = useState<File[] | null>(null);
  // State to control whether multiple files can be selected
  const [allowMultiple, setAllowMultiple] = useState<boolean>(true);
  // State to control whether video capture is allowed
  const [allowVideo, setAllowVideo] = useState<boolean>(true);
  // State to control maximum video duration
  const [maxVideoDuration, setMaxVideoDuration] = useState<number>(30);
  // State to control whether to show preview
  const [showPreview, setShowPreview] = useState<boolean>(true);

  /**
   * Handles the media captured by the ImageCapture component
   * 
   * @param {File[] | null} files - The captured files or null if no files
   */
  const handleMediaCapture = (files: File[] | null) => {
    setCapturedFiles(files);
    console.log('Files captured:', files);
  };

  /**
   * Toggles the allowMultiple state
   */
  const toggleAllowMultiple = () => {
    setAllowMultiple(prev => !prev);
  };

  /**
   * Toggles the allowVideo state
   */
  const toggleAllowVideo = () => {
    setAllowVideo(prev => !prev);
  };

  /**
   * Toggles the showPreview state
   */
  const toggleShowPreview = () => {
    setShowPreview(prev => !prev);
  };

  /**
   * Handles changing the maximum video duration
   */
  const handleMaxDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setMaxVideoDuration(value);
    }
  };

  /**
   * Detects the current platform
   */
  const detectPlatform = (): string => {
    const userAgent = navigator.userAgent;
    
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return 'iOS';
    } else if (/Android/.test(userAgent)) {
      return 'Android';
    } else {
      return 'Web';
    }
  };

  // Get the current platform
  const currentPlatform = detectPlatform();

  return (
    <div className="image-capture-demo">
      <h1>Media Capture Demo</h1>
      
      {window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && (
        <div className="warning-message">
          <p>⚠️ Camera access requires HTTPS. Your current connection is not secure, which may prevent camera access.</p>
          <p>For testing on mobile devices, please use an HTTPS connection.</p>
        </div>
      )}
      
      <div className="platform-info">
        <p>Detected platform: <strong>{currentPlatform}</strong></p>
      </div>
      
      <div className="demo-controls">
        <div className="control-group">
          <label className="control-toggle">
            <input 
              type="checkbox" 
              checked={allowMultiple} 
              onChange={toggleAllowMultiple}
            />
            Allow multiple files
          </label>
        </div>
        
        <div className="control-group">
          <label className="control-toggle">
            <input 
              type="checkbox" 
              checked={allowVideo} 
              onChange={toggleAllowVideo}
            />
            Allow video capture
          </label>
        </div>
        
        <div className="control-group">
          <label className="control-toggle">
            <input 
              type="checkbox" 
              checked={showPreview} 
              onChange={toggleShowPreview}
            />
            Show preview
          </label>
        </div>
        
        {allowVideo && (
          <div className="control-group">
            <label className="control-label">
              Max video duration (seconds):
              <input 
                type="number" 
                min="5" 
                max="120" 
                value={maxVideoDuration} 
                onChange={handleMaxDurationChange}
                className="duration-input"
              />
            </label>
          </div>
        )}
      </div>
      
      <div className="demo-section">
        <h2>Capture or Select Media</h2>
        <ImageCapture 
          onImageCapture={handleMediaCapture}
          allowMultiple={allowMultiple}
          captureButtonText="Take a Photo"
          galleryButtonText="Choose from Gallery"
          allowVideo={allowVideo}
          maxVideoDurationSeconds={maxVideoDuration}
          showPreview={showPreview}
          enableDownload={true}
        />
      </div>
      
      <div className="demo-section">
        <h2>Captured Files Information</h2>
        {capturedFiles && capturedFiles.length > 0 ? (
          <div className="file-info">
            <p><strong>Number of files:</strong> {capturedFiles.length}</p>
            <ul className="file-list">
              {capturedFiles.map((file, index) => (
                <li key={index} className="file-item">
                  <p><strong>{file.type.startsWith('image/') ? 'Image' : 'Video'} {index + 1}:</strong></p>
                  <p>Name: {file.name}</p>
                  <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                  <p>Type: {file.type}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No files captured yet. Use the controls above to capture or select media.</p>
        )}
      </div>
      
      <div className="demo-section">
        <h2>Component Usage Example</h2>
        <pre className="code-example">
{`import React, { useState } from 'react';
import ImageCapture from './components/ImageCapture';

const MyComponent = () => {
  const [mediaFiles, setMediaFiles] = useState(null);

  const handleCapture = (files) => {
    setMediaFiles(files);
    // Process files as needed (upload, display, etc.)
  };

  return (
    <div>
      <h2>Capture Media</h2>
      <ImageCapture 
        onImageCapture={handleCapture}
        allowMultiple={${allowMultiple}}
        allowVideo={${allowVideo}}
        maxVideoDurationSeconds={${maxVideoDuration}}
        showPreview={${showPreview}}
      />
    </div>
  );
};

export default MyComponent;`}
        </pre>
      </div>
      
      <div className="demo-section">
        <h2>Platform-Specific Notes</h2>
        <div className="platform-notes">
          <h3>iOS</h3>
          <ul>
            <li>On iOS, clicking "Choose from Gallery" will show options for Photo Library, Take Photo, etc.</li>
            <li>iOS has native controls for camera and gallery selection.</li>
          </ul>
          
          <h3>Android</h3>
          <ul>
            <li>On Android, the component will use the device camera directly.</li>
            <li>Gallery selection uses the native file picker.</li>
          </ul>
          
          <h3>Web/Desktop</h3>
          <ul>
            <li>On desktop browsers, the component will use the webcam.</li>
            <li>Gallery selection uses the browser's file picker.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageCaptureDemo; 