import React from 'react';
import { ErrorHelpProps } from './types';
import { isMacOS } from './utils';

/**
 * Error help component that provides troubleshooting guidance
 * 
 * @param {ErrorHelpProps} props - Component props
 * @returns {JSX.Element | null} The rendered error help or null if no error
 */
const ErrorHelp: React.FC<ErrorHelpProps> = ({ error, openFileSelection }) => {
  if (!error) return null;
  
  return (
    <div className="platform-help">
      <p>
        <strong>Camera Troubleshooting Help:</strong> If the camera isn't displaying correctly,
        try these steps:
      </p>
      <ol>
        {isMacOS() && (
          <>
            <li>Ensure your browser has camera permissions in System Preferences &gt; Security &amp; Privacy</li>
            <li>For FaceTime HD camera issues, try closing FaceTime, Photo Booth, or any video conferencing apps</li>
            <li>Try using Safari if Chrome continues to have issues with the FaceTime camera</li>
          </>
        )}
        <li>Check browser permissions by clicking the lock/camera icon in the address bar</li>
        <li>Refresh the page and try again</li>
        <li>If using the "Take Photo" button fails, try the "Gallery" option instead</li>
        <li>For persistent issues, try another device or browser</li>
      </ol>
      
      {/* Direct file upload fallback */}
      <div className="fallback-upload">
        <p><strong>Alternative: Upload directly from your device</strong></p>
        <button 
          className="fallback-button"
          onClick={openFileSelection}
        >
          Select from Device
        </button>
      </div>
    </div>
  );
};

export default ErrorHelp; 