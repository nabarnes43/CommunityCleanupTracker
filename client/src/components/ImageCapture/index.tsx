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
import { isIOS, isMobile, getBestVideoMimeType } from './utils';
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

  // Log props for debugging
  useEffect(() => {
    console.log('ImageCapture props:', { allowMultiple, allowVideo, showPreview });
  }, [allowMultiple, allowVideo, showPreview]);

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
   * Adds a captured media item to the state
   * 
   * @param {CapturedMedia} media - The media item to add
   * @param {boolean} skipCallback - Whether to skip calling the callback (used for direct video handling)
   */
  const addCapturedMedia = (media: CapturedMedia, skipCallback: boolean = false) => {
    // Update state with the new media
    setCapturedMedia(prevMedia => {
      // Check if this media already exists to prevent duplicates
      const isDuplicate = prevMedia.some(existingMedia => 
        existingMedia.file.name === media.file.name && 
        existingMedia.file.size === media.file.size && 
        existingMedia.file.type === media.file.type
      );
      
      // If it's a duplicate, return the current state unchanged
      if (isDuplicate) {
        console.log(`Skipping duplicate ${media.type} file:`, media.file.name);
        return prevMedia;
      }
      
      let updatedMedia: CapturedMedia[];
      
      if (allowMultiple) {
        // When allowMultiple is true, append new media to existing media
        updatedMedia = [...prevMedia, media];
      } else {
        // Clean up previous preview URLs
        prevMedia.forEach(m => {
          URL.revokeObjectURL(m.previewUrl);
        });
        
        // Replace existing media with new media
        updatedMedia = [media];
      }
      
      console.log(`Added 1 ${media.type} file to internal state. New total: ${updatedMedia.length}`);
      
      // Call the callback with the updated files if not skipped
      if (!skipCallback) {
        // We use the updated array to ensure we have the latest state
        const allFiles = updatedMedia.map(m => m.file);
        
        // Call this outside of setState to avoid nested state updates
        setTimeout(() => {
          console.log('Calling onImageCapture from addCapturedMedia with', allFiles.length, 'files');
          onImageCapture(allFiles);
        }, 0);
      }
      
      return updatedMedia;
    });
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
      
      // Verify the file is valid before adding it
      if (!file || file.size === 0) {
        throw new Error('Failed to capture a valid image. Please try again.');
      }
      
      console.log('Created image file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      // Add to captured media but skip the callback
      addCapturedMedia({
        file,
        type: 'image',
        previewUrl: URL.createObjectURL(file)
      }, true); // Skip the callback
      
      // Call the callback directly to avoid duplication
      console.log('Calling onImageCapture directly with new image');
      onImageCapture([file]);
      
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
          
          // Verify the file is valid before adding it
          if (!file || file.size === 0) {
            throw new Error('Failed to create a valid video file. Please try again.');
          }
          
          // Create a unique identifier for this video based on timestamp to avoid duplicates
          const uniqueFileName = `video_${Date.now()}.${file.name.split('.').pop()}`;
          const uniqueFile = new File([file], uniqueFileName, { type: file.type });
          
          console.log('Created video file:', {
            name: uniqueFile.name,
            type: uniqueFile.type,
            size: uniqueFile.size
          });
          
          // Add to captured media but skip the callback
          addCapturedMedia({
            file: uniqueFile,
            type: 'video',
            previewUrl: URL.createObjectURL(uniqueFile)
          }, true); // Skip the callback
          
          // IMPORTANT: For videos captured directly, we'll call onImageCapture directly
          // This bypasses the internal capturedMedia state's callback to avoid duplication
          console.log('Calling onImageCapture directly with new video');
          onImageCapture([uniqueFile]);
          
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
    // Log current mode for debugging
    console.log('Video action triggered in mode:', isVideoMode ? 'video' : 'photo');
    
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
    console.log('Toggling mode from', isVideoMode ? 'video' : 'photo', 'to', !isVideoMode ? 'video' : 'photo');
    
    if (isRecording) {
      stopRecording();
    }
    
    if (isCameraActive) {
      stopCamera();
    }
    
    // Clear any errors when switching modes
    setError(null);
    
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
    
    // Log file information for debugging
    console.log('File selection:', fileArray.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size
    })));
    console.log('allowMultiple:', allowMultiple);
    
    // Validate files before processing
    // Check for empty files
    const validFiles = fileArray.filter(file => file.size > 0);
    
    // Check if we have any valid files after filtering
    if (validFiles.length === 0) {
      setError('No valid files were selected. Files may be empty or corrupted.');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Define supported formats
    const supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const supportedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    
    // Determine if we're in image or video mode
    const currentMode = isVideoMode ? 'video' : 'image';
    
    // Filter files to match the current mode
    const modeFilteredFiles = validFiles.filter(file => {
      const fileType = file.type.split('/')[0]; // 'image' or 'video'
      return fileType === currentMode;
    });
    
    if (modeFilteredFiles.length === 0) {
      setError(`Please select only ${currentMode} files when in ${currentMode} mode.`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Check for format support based on mode
    const unsupportedFiles = modeFilteredFiles.filter(file => {
      if (file.type.startsWith('image/')) {
        return !supportedImageTypes.includes(file.type);
      } else if (file.type.startsWith('video/')) {
        return !supportedVideoTypes.includes(file.type);
      }
      return true; // Any other type is unsupported
    });
    
    if (unsupportedFiles.length > 0) {
      // Create a more specific error message
      const fileTypes = unsupportedFiles.map(f => f.type || 'unknown type').join(', ');
      if (unsupportedFiles[0].type.startsWith('image/')) {
        setError(`Unsupported image format: ${fileTypes}. Please use JPG, PNG, or GIF formats.`);
      } else if (unsupportedFiles[0].type.startsWith('video/')) {
        setError(`Unsupported video format: ${fileTypes}. Please use MP4, MOV, or AVI formats.`);
      } else {
        setError(`Unsupported file format: ${fileTypes}. Please use supported image or video formats.`);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Filter out any files that are already in capturedMedia to prevent duplicates
    const uniqueFiles = modeFilteredFiles.filter(newFile => {
      // Check if this file already exists in capturedMedia
      return !capturedMedia.some(existingMedia => 
        existingMedia.file.name === newFile.name && 
        existingMedia.file.size === newFile.size && 
        existingMedia.file.type === newFile.type
      );
    });
    
    // If all files were duplicates, show a message and exit
    if (uniqueFiles.length === 0) {
      setError('All selected files have already been added.');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Add files to internal state but skip the callback
    for (const file of uniqueFiles) {
      // Create a new media object
      const newMedia: CapturedMedia = {
        file,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        previewUrl: URL.createObjectURL(file)
      };
      
      // Add to captured media but skip the callback
      if (allowMultiple) {
        // When allowMultiple is true, append new media to existing media
        setCapturedMedia(prev => [...prev, newMedia]);
      } else {
        // Clean up previous preview URLs
        capturedMedia.forEach(media => {
          URL.revokeObjectURL(media.previewUrl);
        });
        
        // Replace existing media with new media
        setCapturedMedia([newMedia]);
      }
    }
    
    // Call the callback directly with just the new files
    console.log('Calling onImageCapture directly with selected files:', uniqueFiles.length);
    onImageCapture(uniqueFiles);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Removes a media item from the captured media array
   * 
   * @param {number} index - The index of the media item to remove
   */
  const handleRemoveMedia = (index: number) => {
    setCapturedMedia(prevMedia => {
      // Create a copy of the current media array
      const updatedMedia = [...prevMedia];
      
      // Get the media item to remove
      const mediaToRemove = updatedMedia[index];
      
      if (mediaToRemove) {
        // Revoke the object URL to prevent memory leaks
        URL.revokeObjectURL(mediaToRemove.previewUrl);
        
        // Remove the item from the array
        updatedMedia.splice(index, 1);
        
        console.log(`Removed 1 ${mediaToRemove.type} file. New total: ${updatedMedia.length}`);
        
        // Call the callback with the updated files
        const allFiles = updatedMedia.map(m => m.file);
        
        // Call this outside of setState to avoid nested state updates
        setTimeout(() => onImageCapture(allFiles), 0);
      }
      
      return updatedMedia;
    });
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
  const isMobileDevice = isMobile();

  return (
    <div className="image-capture">
      <div className="image-capture-container">
        {error && <div className="error-message">{error}</div>}
        
        {isCameraActive && (
          <div className="camera-preview-wrapper">
            <div className="mode-indicator">
              {isVideoMode ? 'Video Mode' : 'Photo Mode'}
            </div>
            
            <button 
              className="close-camera-button"
              onClick={stopCamera}
              disabled={isRecording}
              aria-label="Close camera"
            >
              ×
            </button>
            
            <CameraPreview
              stream={stream}
              isRecording={isRecording}
              recordingTime={recordingTime}
              videoRef={videoRef}
              onError={setError}
            />
          </div>
        )}
        
        {!isCameraActive && (
          <div className="mode-indicator-standalone">
            {isVideoMode ? 'Video Mode' : 'Photo Mode'}
          </div>
        )}
        
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
        
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept={isVideoMode ? 'video/*' : 'image/*'}
          onChange={handleFileSelection}
          multiple={allowMultiple}
          {...(useIOSControls ? { capture: isVideoMode ? "user" : "environment" } : {})}
        />
        
        {error && (
          <ErrorHelp
            error={error}
            openFileSelection={openFileSelection}
          />
        )}
        
        {showPreview && capturedMedia.length > 0 && (
          <div className="media-preview-section">
            <h3>Captured Media ({capturedMedia.length})</h3>
            <MediaPreview
              capturedMedia={capturedMedia}
              onRemove={handleRemoveMedia}
              onDownload={enableDownload ? downloadMedia : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCapture;