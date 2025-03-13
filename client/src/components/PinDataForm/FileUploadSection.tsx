import React from 'react';

/**
 * Props for the FileUploadSection component
 */
interface FileUploadSectionProps {
  /** Array of image files */
  images: File[];
  /** Array of video files */
  videos: File[];
  /** Handler for file uploads */
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, fileType: 'images' | 'videos') => void;
}

/**
 * Component for handling file uploads in the form
 * 
 * @param {FileUploadSectionProps} props - Component props
 * @returns {JSX.Element} The rendered FileUploadSection component
 */
const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  images,
  videos,
  onFileUpload
}) => {
  return (
    <div className="file-upload-section">
      <div className="upload-group">
        <label>Upload Images (up to 5):</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif"
          multiple
          onChange={(e) => onFileUpload(e, 'images')}
        />
        <div className="preview-container">
          {images.map((image, index) => (
            <div key={`img-${index}`} className="preview-item">
              <img
                src={URL.createObjectURL(image)}
                alt={`Preview ${index + 1}`}
                className="image-thumbnail"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="upload-group">
        <label>Upload Videos (up to 2):</label>
        <input
          type="file"
          accept="video/mp4,video/quicktime,video/x-msvideo"
          multiple
          onChange={(e) => onFileUpload(e, 'videos')}
        />
        <div className="preview-container">
          {videos.map((video, index) => (
            <div key={`vid-${index}`} className="preview-item">
              <video
                src={URL.createObjectURL(video)}
                className="video-thumbnail"
                controls
                width="200"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUploadSection; 