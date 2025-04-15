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
 * Camera icon component
 */
const CameraIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 16.8V7.2C3 6.0799 3 5.51984 3.21799 5.09202C3.40973 4.71569 3.71569 4.40973 4.09202 4.21799C4.51984 4 5.0799 4 6.2 4H7.25464C7.37758 4 7.43905 4 7.49576 4.02513C7.54541 4.04694 7.59262 4.07484 7.63535 4.10858C7.68403 4.14768 7.72568 4.1989 7.80897 4.30134L8.19103 4.76569C8.27432 4.86813 8.31597 4.91935 8.36465 4.95845C8.40738 4.99219 8.45459 5.02009 8.50424 5.0419C8.56095 5.06704 8.62242 5.06704 8.74536 5.06704H15.2546C15.3776 5.06704 15.439 5.06704 15.4958 5.0419C15.5454 5.02009 15.5926 4.99219 15.6354 4.95845C15.684 4.91935 15.7257 4.86813 15.809 4.76569L16.191 4.30134C16.2743 4.1989 16.316 4.14768 16.3646 4.10858C16.4074 4.07484 16.4546 4.04694 16.5042 4.02513C16.561 4 16.6224 4 16.7454 4H17.8C18.9201 4 19.4802 4 19.908 4.21799C20.2843 4.40973 20.5903 4.71569 20.782 5.09202C21 5.51984 21 6.0799 21 7.2V16.8C21 17.9201 21 18.4802 20.782 18.908C20.5903 19.2843 20.2843 19.5903 19.908 19.782C19.4802 20 18.9201 20 17.8 20H6.2C5.0799 20 4.51984 20 4.09202 19.782C3.71569 19.5903 3.40973 19.2843 3.21799 18.908C3 18.4802 3 17.9201 3 16.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * Video icon component
 */
const VideoIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 8.34V7.33C15 6.13426 15 5.53638 14.782 5.07603C14.5903 4.66784 14.2813 4.32768 13.8969 4.12264C13.459 3.89498 12.8904 3.87747 11.7531 3.84244C10.6157 3.8074 10.047 3.78988 9.60898 4.01754C9.22462 4.22258 8.91569 4.56274 8.72398 4.97093C8.50597 5.43128 8.50597 6.02917 8.50597 7.22491V16.7751C8.50597 17.9708 8.50597 18.5687 8.72398 19.0291C8.91569 19.4373 9.22462 19.7774 9.60898 19.9825C10.047 20.2101 10.6157 20.1926 11.7531 20.1576C12.8904 20.1225 13.459 20.105 13.8969 19.8774C14.2813 19.6723 14.5903 19.3322 14.782 18.924C15 18.4636 15 17.8657 15 16.67V15.66M15 12H19.5M21.5 9L19.5 12L21.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="4" width="5.5" height="16" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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