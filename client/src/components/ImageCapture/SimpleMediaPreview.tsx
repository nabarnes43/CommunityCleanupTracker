import React, { useEffect, useState } from 'react';
import './SimpleMediaPreview.css';

/**
 * Media file interface extending File
 */
interface MediaFile extends File {
  type: string;
}

/**
 * Props for the SimpleMediaPreview component
 */
interface SimpleMediaPreviewProps {
  /** Array of media files (images and videos) */
  mediaFiles: MediaFile[];
  /** Handler for removing files */
  onRemoveFile: (index: number) => void;
}

/**
 * Component to display previews of selected media files
 * 
 * @param {SimpleMediaPreviewProps} props - Component props
 * @returns {JSX.Element} The rendered SimpleMediaPreview component
 */
const SimpleMediaPreview: React.FC<SimpleMediaPreviewProps> = ({
  mediaFiles,
  onRemoveFile
}) => {
  // State to track preview URLs
  const [previewUrls, setPreviewUrls] = useState<{[key: string]: string}>({});
  
  // Create and clean up preview URLs when mediaFiles change
  useEffect(() => {
    const newUrls: {[key: string]: string} = {};
    
    // Create URLs for all media files
    mediaFiles.forEach((file, index) => {
      const key = `media-${index}-${file.name}`;
      newUrls[key] = URL.createObjectURL(file);
    });
    
    // Update state with new URLs
    setPreviewUrls(newUrls);
    
    // Clean up old URLs when component unmounts or dependencies change
    return () => {
      Object.values(newUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [mediaFiles]);

  // Count images and videos
  const imageCount = mediaFiles.filter(file => file.type.startsWith('image/')).length;
  const videoCount = mediaFiles.filter(file => file.type.startsWith('video/')).length;

  return (
    <div className="simple-media-preview">
      <div className="preview-section">
        <h4>Media Files ({mediaFiles.length}/7)</h4>
        <div className="media-counts">
          <span>Images: {imageCount}/5</span>
          <span>Videos: {videoCount}/2</span>
        </div>
        <div className="preview-grid">
          {mediaFiles.length > 0 ? (
            mediaFiles.map((file, index) => (
              <div className="preview-item" key={`media-${index}`}>
                {file.type.startsWith('image/') ? (
                  <img 
                    src={previewUrls[`media-${index}-${file.name}`]} 
                    alt={`Preview ${index}`} 
                  />
                ) : (
                  <video 
                    src={previewUrls[`media-${index}-${file.name}`]} 
                    controls
                  />
                )}
                <button 
                  className="remove-button"
                  onClick={() => onRemoveFile(index)}
                  aria-label="Remove media"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <div className="no-media-message">No media files selected</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleMediaPreview; 