import React from 'react';
import SimpleFileSelector from './SimpleFileSelector';
import SimpleMediaPreview from './SimpleMediaPreview';
import './index.css';

/**
 * Media file type
 */
interface MediaFile extends File {
  type: string;
  preview?: string;
}

/**
 * Props for the ImageCapture component
 */
interface ImageCaptureProps {
  /** Array of media files (images and videos) */
  mediaFiles: MediaFile[];
  /** Handler for file uploads */
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Handler for removing files */
  onRemoveFile: (index: number) => void;
}

/**
 * A component that allows users to select media files (images and videos)
 * 
 * @param {ImageCaptureProps} props - Component props
 * @returns {JSX.Element} The rendered ImageCapture component
 */
const ImageCapture: React.FC<ImageCaptureProps> = ({
  mediaFiles,
  onFileUpload,
  onRemoveFile
}) => {
  return (
    <div className="upload-media-container">
      <div className="input-header">
        <label>Upload Media:</label>
      </div>
        <SimpleFileSelector
          accept="image/*,video/*"
          label="Media"
          icon={<MediaIcon />}
          onFileSelect={onFileUpload}
          buttonClassName="media-selector"
        />
      {/* Preview component to show all selected files */}
      <SimpleMediaPreview
        mediaFiles={mediaFiles}
        onRemoveFile={onRemoveFile}
      />
    </div>
  );
};

/**
 * Media icon component (combination of camera and video)
 */
const MediaIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 6H3C2.44772 6 2 6.44772 2 7V17C2 17.5523 2.44772 18 3 18H15C15.5523 18 16 17.5523 16 17V7C16 6.44772 15.5523 6 15 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 10L20.618 6.63666C20.7505 6.5468 20.9078 6.49493 21.0706 6.4881C21.2334 6.48127 21.395 6.51967 21.5342 6.59858C21.6734 6.67749 21.7848 6.79332 21.8553 6.93305C21.9258 7.07278 21.9524 7.23028 21.932 7.38562V16.6144C21.9524 16.7697 21.9258 16.9272 21.8553 17.0669C21.7848 17.2067 21.6734 17.3225 21.5342 17.4014C21.395 17.4803 21.2334 17.5187 21.0706 17.5119C20.9078 17.5051 20.7505 17.4532 20.618 17.3633L16 14V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7.5" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export default ImageCapture; 