import React, { useState, useEffect } from 'react';
import ImageCapture from '../ImageCapture';
import './PinDataForm.css';

/**
 * Props for the CameraCapture component
 */
interface CameraCaptureProps {
  /** Array of image files */
  images: File[];
  /** Array of video files */
  videos: File[];
  /** Handler for file uploads */
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, fileType: 'images' | 'videos') => void;
  /** Optional modal mode flag */
  isModal?: boolean;
  /** Handler for removing files */
  onRemoveFile?: (fileType: 'images' | 'videos', index: number) => void;
}

/**
 * Simplified camera capture component that directly embeds the camera functionality
 * 
 * @param {CameraCaptureProps} props - Component props
 * @returns {JSX.Element} The rendered CameraCapture component
 */
const CameraCapture: React.FC<CameraCaptureProps> = ({
  images,
  videos,
  onFileUpload,
  isModal = true, // Default to modal mode
  onRemoveFile
}) => {
  // State to track error messages
  const [error, setError] = useState<string | null>(null);
  // State to track preview URLs
  const [previewUrls, setPreviewUrls] = useState<{[key: string]: string}>({});
  
  // Filter out any invalid files
  const validImages = images.filter(img => img.size > 0);
  const validVideos = videos.filter(vid => vid.size > 0);
  
  // Create and clean up preview URLs when images or videos change
  useEffect(() => {
    const newUrls: {[key: string]: string} = {};
    
    // Create URLs for images
    validImages.forEach((image, index) => {
      const key = `img-${index}-${image.name}`;
      newUrls[key] = URL.createObjectURL(image);
    });
    
    // Create URLs for videos
    validVideos.forEach((video, index) => {
      const key = `vid-${index}-${video.name}`;
      newUrls[key] = URL.createObjectURL(video);
    });
    
    // Update state with new URLs
    setPreviewUrls(newUrls);
    
    // Clean up old URLs when component unmounts or dependencies change
    return () => {
      Object.values(newUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [images, videos]);

  
  /**
   * Handles image capture from the ImageCapture component
   * Processes files and passes them to the parent component
   * 
   * @param {File[] | null} files - Array of captured files or null
   */
  const handleImageCapture = (files: File[] | null) => {
    console.log('CameraCapture received files:', files?.length || 0);
    console.log('Current validImages:', validImages.length, 'validVideos:', validVideos.length);
    
    if (!files || files.length === 0) {
      console.warn('No files received in handleImageCapture');
      return;
    }
    
    // Log detailed information about each file
    files.forEach((file, index) => {
      console.log(`File ${index}:`, {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      });
    });
    
    // Process each file individually to ensure proper type detection
    files.forEach(file => {
      console.log('Processing file:', file.name, file.type, file.size);
      
      // Determine file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        console.warn(`Unsupported file type: ${file.type}`);
        return;
      }
      
      // Create a synthetic event to pass to the onFileUpload handler
      const syntheticEvent = {
        target: {
          files: [file] as unknown as FileList
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      // Call the appropriate handler based on file type
      if (isImage) {
        // Check if this image already exists in the images array to prevent duplication
        const isDuplicate = validImages.some(img => 
          img.name === file.name && 
          img.size === file.size && 
          img.type === file.type
        );
        
        if (!isDuplicate) {
          console.log('Adding new image:', file.name);
          onFileUpload(syntheticEvent, 'images');
        } else {
          console.log('Skipping duplicate image:', file.name);
        }
      } else if (isVideo) {
        // For videos, we need a more robust check since they might have generated names
        // First check exact matches
        let isDuplicate = validVideos.some(vid => 
          vid.name === file.name && 
          vid.size === file.size && 
          vid.type === file.type
        );
        
        // If not an exact match, check if we have a video with similar size (within 5%)
        // This helps catch videos that might have been renamed but are the same content
        if (!isDuplicate && validVideos.length > 0) {
          isDuplicate = validVideos.some(vid => {
            // Check if file sizes are within 5% of each other
            const sizeDifference = Math.abs(vid.size - file.size);
            const sizePercentage = sizeDifference / Math.max(vid.size, file.size);
            const isSimilarSize = sizePercentage < 0.05 && vid.type === file.type;
            
            if (isSimilarSize) {
              console.log('Found similar video by size comparison:', {
                existingVideo: { name: vid.name, size: vid.size },
                newVideo: { name: file.name, size: file.size },
                sizeDifference,
                sizePercentage
              });
            }
            
            // If size is similar and type matches, likely a duplicate
            return isSimilarSize;
          });
        }
        
        if (!isDuplicate) {
          console.log('Adding new video:', file.name);
          onFileUpload(syntheticEvent, 'videos');
        } else {
          console.log('Skipping duplicate video:', file.name);
        }
      }
    });
  };
  
  /**
   * Handles video preview click by creating a modal to play the video
   * 
   * @param {string} videoUrl - URL of the video to play
   */
  const handleVideoPreviewClick = (videoUrl: string) => {
    // Create a modal or overlay to play the video
    const videoModal = document.createElement('div');
    videoModal.style.position = 'fixed';
    videoModal.style.top = '0';
    videoModal.style.left = '0';
    videoModal.style.width = '100%';
    videoModal.style.height = '100%';
    videoModal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    videoModal.style.zIndex = '1000';
    videoModal.style.display = 'flex';
    videoModal.style.justifyContent = 'center';
    videoModal.style.alignItems = 'center';
    
    // Create video element
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.style.maxWidth = '90%';
    videoElement.style.maxHeight = '80%';
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '30px';
    closeButton.style.cursor = 'pointer';
    
    // Close modal when button is clicked
    closeButton.onclick = () => {
      document.body.removeChild(videoModal);
    };
    
    // Close modal when clicking outside the video
    videoModal.onclick = (e) => {
      if (e.target === videoModal) {
        document.body.removeChild(videoModal);
      }
    };
    
    // Add elements to modal
    videoModal.appendChild(videoElement);
    videoModal.appendChild(closeButton);
    
    // Add modal to body
    document.body.appendChild(videoModal);
  };

  return (
    <div className="media-wrapper">
      <div className="media-info">
        <div className="upload-limits">
          <div>Photos: {validImages.length}/5</div>
          <div>Videos: {validVideos.length}/2</div>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>
      
      <ImageCapture
        allowVideo={true}
        allowMultiple={true}
        showPreview={false} // Disable internal preview to avoid confusion
        enableDownload={false}
        captureButtonText="Take Photo"
        galleryButtonText="Select Photo"
        onImageCapture={handleImageCapture}
      />
      
      {/* Display thumbnails of current uploads */}
      {(validImages.length > 0 || validVideos.length > 0) && (
        <div className="mt-md w-100">
          <h4 className="w-100 mb-sm">Captured Media:</h4>
          
          {validImages.length > 0 && (
            <div>
              <p className="text-sm mb-xs">Images ({validImages.length}/5):</p>
              <div className="preview-container">
                {validImages.map((image, index) => (
                  <div key={`img-container-${index}-${image.name}`} className="thumbnail-container">
                    <img 
                      key={`img-${index}-${image.name}`}
                      src={previewUrls[`img-${index}-${image.name}`] || ''}
                      alt={`Image ${index + 1}`}
                      className="thumbnail"
                    />
                    {onRemoveFile && (
                      <div 
                        className="remove-button"
                        onClick={() => onRemoveFile('images', index)}
                        title="Remove image"
                      >
                        ×
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {validVideos.length > 0 && (
            <div>
              <p className="text-sm mb-xs">Videos ({validVideos.length}/2):</p>
              <div className="preview-container">
                {validVideos.map((video, index) => (
                  <div 
                    key={`vid-container-${index}-${video.name}`}
                    className="thumbnail-container"
                  >
                    <div 
                      className="video-thumbnail"
                      onClick={() => handleVideoPreviewClick(previewUrls[`vid-${index}-${video.name}`] || '')}
                    >
                      <video 
                        src={previewUrls[`vid-${index}-${video.name}`] || ''}
                        className="thumbnail"
                        preload="metadata"
                      />
                      <div className="video-play-icon">▶</div>
                    </div>
                    {onRemoveFile && (
                      <div 
                        className="remove-button"
                        onClick={() => onRemoveFile('videos', index)}
                        title="Remove video"
                      >
                        ×
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraCapture; 