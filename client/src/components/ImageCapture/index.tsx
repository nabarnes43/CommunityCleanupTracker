import React, { useState, useRef, useEffect } from 'react';
import './styles.css';

// Import types
import { ImageCaptureProps, CapturedMedia } from './types';

// Import components
import CameraPreview from './CameraPreview';
import CameraControls from './CameraControls';
import IOSControls from './IOSControls';
import ErrorHelp from './ErrorHelp';
import MediaPreview from './MediaPreview';

// Import utilities
import { isIOS, getBestVideoMimeType } from './utils';
import { CameraService } from './CameraService';

/**
 * ImageCapture component for capturing photos and videos
 * 
 * This component is designed to work across different platforms:
 * - iOS: Uses native file input with capture attribute
 * - Android: Uses direct camera access with media stream
 * - Desktop/Web: Uses direct camera access with media stream
 * 
 * @param {ImageCaptureProps} props - Component props
 * @returns {JSX.Element} The rendered ImageCapture component
 */
const ImageCapture: React.FC<ImageCaptureProps> = ({
  onImageCapture,
  allowMultiple = false,
  captureButtonText = 'Capture',
  galleryButtonText = 'Gallery',
  allowVideo = false,
  maxVideoDurationSeconds = 30,
  showPreview = true,
  enableDownload = true,
}) => {
  // State to manage media stream
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isVideoMode, setIsVideoMode] = useState<boolean>(false);
  
  // State to manage captured media
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia[]>([]);
  
  // Refs for DOM elements and recording
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Cleanup function to revoke object URLs when component unmounts
   */
  useEffect(() => {
    return () => {
      // Clean up all preview URLs
      capturedMedia.forEach(media => {
        URL.revokeObjectURL(media.previewUrl);
      });
    };
  }, []);

  /**
   * Starts the camera by requesting user media
   */
  const startCamera = async () => {
    try {
      // Clear any previous errors
      setError(null);
      
      console.log('Starting camera, video mode:', isVideoMode);
      
      // Request camera access
      const mediaStream = await CameraService.startCamera(allowVideo && isVideoMode);
      
      // Save the stream and update state
      setStream(mediaStream);
      setIsCameraActive(true);
      
      console.log('Camera started successfully');
      
    } catch (err) {
      console.error('Camera start error:', err);
      
      // Handle specific error types for better user feedback
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            setError('Camera access denied. Please grant permission in your browser settings.');
            break;
          case 'NotFoundError':
            setError('No camera detected. Please check your device.');
            break;
          case 'NotReadableError':
            setError('Camera is being used by another application or not accessible.');
            break;
          case 'OverconstrainedError':
            setError('Camera not compatible. Please try another browser or device.');
            break;
          default:
            setError('Could not access camera. Please check permissions.');
        }
      } else {
        setError('Camera error. Please check your device and permissions.');
      }
    }
  };

  /**
   * Stops the camera stream and cleans up resources
   */
  const stopCamera = () => {
    console.log('Stopping camera');
    
    if (stream) {
      // Stop all tracks in the stream
      stream.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind, track.label);
        track.stop();
      });
      setStream(null);
    }
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    setIsRecording(false);
    setRecordingTime(0);
    
    console.log('Camera stopped');
  };

  /**
   * Toggles camera on/off
   */
  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  /**
   * Adds a new media file to the captured media array
   * 
   * @param {File} file - The captured file
   */
  const addCapturedMedia = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const newMedia: CapturedMedia = {
      file,
      type: isImage ? 'image' : 'video',
      previewUrl: URL.createObjectURL(file)
    };
    
    if (allowMultiple) {
      setCapturedMedia(prev => [...prev, newMedia]);
    } else {
      // Clean up previous preview URLs
      capturedMedia.forEach(media => {
        URL.revokeObjectURL(media.previewUrl);
      });
      setCapturedMedia([newMedia]);
    }
    
    // Call the callback with all files
    const updatedFiles = allowMultiple 
      ? [...capturedMedia.map(m => m.file), file]
      : [file];
    
    onImageCapture(updatedFiles);
  };

  /**
   * Captures a still image from the video stream
   */
  const captureImage = async () => {
    if (!videoRef.current) {
      setError('Video preview not available');
      return;
    }
    
    try {
      console.log('Capturing image');
      
      // Use the CameraService to capture the image
      const file = await CameraService.captureImage(videoRef.current);
      
      // Add to captured media
      addCapturedMedia(file);
      
      // Stop camera after successful capture
      stopCamera();
      
    } catch (err) {
      console.error('Image capture error:', err);
      setError(err instanceof Error ? err.message : 'Failed to capture image. Please try again.');
    }
  };

  /**
   * Starts video recording from the stream
   */
  const startRecording = () => {
    if (!stream) {
      setError('Camera stream not available');
      return;
    }
    
    try {
      console.log('Starting video recording');
      
      // Reset recorded chunks
      recordedChunksRef.current = [];
      
      // Get MIME type
      const mimeType = getBestVideoMimeType();
      
      // Create MediaRecorder instance
      const mediaRecorder = CameraService.createMediaRecorder(stream);
      
      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stopped event
      mediaRecorder.onstop = () => {
        console.log('Recording stopped, processing video');
        
        if (recordedChunksRef.current.length === 0) {
          setError('No video data recorded');
          return;
        }
        
        try {
          // Create a File from the recorded chunks
          const file = CameraService.createVideoFile(recordedChunksRef.current, mimeType);
          
          // Add to captured media
          addCapturedMedia(file);
          
          // Stop camera after recording
          stopCamera();
        } catch (err) {
          console.error('Error processing recorded video:', err);
          setError('Failed to process recorded video');
        }
      };
      
      // Start recording
      mediaRecorder.start(100); // Collect data in 100ms chunks
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer for recording duration display
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prevTime) => {
          // Auto-stop if max duration reached
          if (prevTime + 1 >= maxVideoDurationSeconds) {
            stopRecording();
            return maxVideoDurationSeconds;
          }
          return prevTime + 1;
        });
      }, 1000);
      
      // Fallback timeout to ensure recording stops
      setTimeout(() => {
        if (isRecording && mediaRecorderRef.current) {
          stopRecording();
        }
      }, maxVideoDurationSeconds * 1000 + 500); // Add buffer
      
    } catch (err) {
      console.error('Recording error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording. Please try again.');
    }
  };

  /**
   * Stops video recording
   */
  const stopRecording = () => {
    console.log('Stopping recording');
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop media recorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      console.log('MediaRecorder stopped');
    }
    
    setIsRecording(false);
  };

  /**
   * Handles video action (start/stop recording)
   */
  const handleVideoAction = () => {
    if (isVideoMode) {
      // In video mode, handle recording
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    } else {
      // In photo mode, capture an image
      captureImage();
    }
  };

  /**
   * Toggles between photo and video mode
   */
  const toggleMode = () => {
    if (isRecording) {
      stopRecording();
    }
    
    if (isCameraActive) {
      stopCamera();
    }
    
    setIsVideoMode(!isVideoMode);
  };

  /**
   * Opens the file selection dialog
   */
  const openFileSelection = () => {
    if (fileInputRef.current) {
      // For iOS, ensure the capture attribute is set for direct camera access
      if (useIOSControls) {
        fileInputRef.current.setAttribute('capture', isVideoMode ? 'user' : 'environment');
      }
      fileInputRef.current.click();
    }
  };

  /**
   * Handles file selection from the file input
   */
  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    // Convert FileList to array
    const fileArray = Array.from(files);
    
    // Process each file
    const newMedia: CapturedMedia[] = fileArray.map(file => ({
      file,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      previewUrl: URL.createObjectURL(file)
    }));
    
    // Update captured media
    if (allowMultiple) {
      setCapturedMedia(prev => [...prev, ...newMedia]);
      onImageCapture([...capturedMedia.map(m => m.file), ...fileArray]);
    } else {
      // Clean up previous preview URLs
      capturedMedia.forEach(media => {
        URL.revokeObjectURL(media.previewUrl);
      });
      setCapturedMedia(newMedia);
      onImageCapture(fileArray);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Removes a media file from the captured media
   */
  const removeMedia = (index: number) => {
    if (index < 0 || index >= capturedMedia.length) return;
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(capturedMedia[index].previewUrl);
    
    // Remove the media from the array
    const newMedia = [...capturedMedia];
    newMedia.splice(index, 1);
    setCapturedMedia(newMedia);
    
    // Update the callback
    if (newMedia.length === 0) {
      onImageCapture(null);
    } else {
      onImageCapture(newMedia.map(m => m.file));
    }
  };

  /**
   * Downloads a media file
   */
  const downloadMedia = (index: number) => {
    if (index < 0 || index >= capturedMedia.length) return;
    
    const media = capturedMedia[index];
    const url = URL.createObjectURL(media.file);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = media.file.name;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Determine if we should use iOS-specific controls
  const useIOSControls = isIOS();

  return (
    <div className="image-capture">
      {/* Camera preview */}
      {isCameraActive && (
        <CameraPreview
          stream={stream}
          isRecording={isRecording}
          recordingTime={recordingTime}
          videoRef={videoRef}
          onError={setError}
        />
      )}
      
      {/* Error message */}
      {error && (
        <ErrorHelp
          error={error}
          openFileSelection={openFileSelection}
        />
      )}
      
      {/* Camera controls */}
      {!useIOSControls && !error && (
        <CameraControls
          isCameraActive={isCameraActive}
          isRecording={isRecording}
          isVideoMode={isVideoMode}
          allowVideo={allowVideo}
          captureButtonText={captureButtonText}
          galleryButtonText={galleryButtonText}
          toggleCamera={toggleCamera}
          handleVideoAction={handleVideoAction}
          toggleMode={toggleMode}
          stopCamera={stopCamera}
          openFileSelection={openFileSelection}
        />
      )}
      
      {/* iOS-specific controls */}
      {useIOSControls && !error && (
        <IOSControls
          isVideoMode={isVideoMode}
          captureButtonText={captureButtonText}
          galleryButtonText={galleryButtonText}
          allowVideo={allowVideo}
          openFileSelection={openFileSelection}
          toggleMode={toggleMode}
          fileInputRef={fileInputRef}
        />
      )}
      
      {/* File input for gallery selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelection}
        accept={allowVideo && isVideoMode ? "video/*" : "image/*"}
        multiple={allowMultiple}
        style={{ display: 'none' }}
        {...(useIOSControls ? { capture: isVideoMode ? "user" : "environment" } : {})}
      />
      
      {/* Media preview */}
      {showPreview && capturedMedia.length > 0 && (
        <div className="media-preview-section">
          <MediaPreview
            capturedMedia={capturedMedia}
            onRemove={removeMedia}
            onDownload={enableDownload ? downloadMedia : undefined}
          />
        </div>
      )}
    </div>
  );
};

export default ImageCapture;