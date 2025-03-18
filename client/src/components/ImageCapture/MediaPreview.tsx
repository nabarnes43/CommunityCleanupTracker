import React, { useState } from 'react';
import { MediaPreviewProps } from './types';

/**
 * Component for displaying previews of captured media (images and videos)
 * 
 * @param {MediaPreviewProps} props - Component props
 * @returns {JSX.Element} The rendered MediaPreview component
 */
const MediaPreview: React.FC<MediaPreviewProps> = ({
  capturedMedia,
  onRemove,
  onDownload
}) => {
  // State to track the currently selected media for preview
  const [selectedIndex, setSelectedIndex] = useState<number>(
    capturedMedia.length > 0 ? 0 : -1
  );

  // If no media, don't render anything
  if (capturedMedia.length === 0) {
    return null;
  }

  return (
    <div className="media-preview-container">
      {selectedIndex >= 0 && (
        <div className="media-preview">
          {capturedMedia[selectedIndex].type === 'image' ? (
            <img 
              src={capturedMedia[selectedIndex].previewUrl} 
              alt={`Preview ${selectedIndex + 1}`} 
              className="preview-image"
            />
          ) : (
            <video 
              src={capturedMedia[selectedIndex].previewUrl} 
              controls 
              autoPlay={false}
              className="preview-video"
            />
          )}
          <div className="preview-actions">
            {onDownload && (
              <button 
                onClick={() => onDownload(selectedIndex)}
                className="action-button download-button"
              >
                Download
              </button>
            )}
            <button 
              onClick={() => onRemove(selectedIndex)}
              className="action-button remove-button"
            >
              Remove
            </button>
          </div>
        </div>
      )}
      
      <div className="media-thumbnails">
        {capturedMedia.map((media, index) => (
          <div 
            key={index} 
            className={`media-thumbnail ${selectedIndex === index ? 'selected' : ''}`}
            onClick={() => setSelectedIndex(index)}
          >
            {media.type === 'image' ? (
              <img src={media.previewUrl} alt={`Thumbnail ${index + 1}`} />
            ) : (
              <div className="video-thumbnail">
                <video 
                  src={media.previewUrl} 
                  className="video-thumb-preview"
                  muted
                  preload="metadata"
                />
                <span className="video-icon">▶</span>
                <span className="video-label">Video</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaPreview; 