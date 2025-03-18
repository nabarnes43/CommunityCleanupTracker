# Pin Data Form with Camera Capture

This component allows users to submit data about community issues with the ability to capture images and videos directly from their device's camera.

## Features

- Form for submitting data about community issues (illegal dumping, standing water, stormwater problems)
- Traditional file upload for images and videos
- Direct camera capture for images and videos
- Validation for file types, sizes, and counts
- Responsive design that works on mobile and desktop

## File Limits

The component enforces the following limits:

- Images: Up to 5 images, max 10MB each, formats: JPEG, PNG, GIF
- Videos: Up to 2 videos, max 50MB each, formats: MP4, QuickTime, AVI
- Video recording: Maximum 30 seconds per video

## Components

### CameraCapture

The `CameraCapture` component combines traditional file upload with direct camera capture functionality. It provides a toggle to switch between:

1. **Upload Files**: Traditional file input for selecting files from the device
2. **Use Camera**: Direct camera access for capturing photos and videos

### ImageCapture

The `ImageCapture` component (from `../ImageCapture`) provides the camera functionality:

- Works across different platforms (iOS, Android, Desktop)
- Handles both photo and video capture
- Provides a preview of captured media
- Enforces video duration limits

### FileUploadSection

The original file upload component that allows users to select files from their device.

## Usage

```tsx
import React, { useState } from 'react';
import CameraCapture from './CameraCapture';

const MyForm = () => {
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: 'images' | 'videos'
  ) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    
    if (fileType === 'images') {
      setImages(prevImages => [...prevImages, ...files]);
    } else {
      setVideos(prevVideos => [...prevVideos, ...files]);
    }
  };

  return (
    <form>
      <CameraCapture
        images={images}
        videos={videos}
        onFileUpload={handleFileUpload}
      />
      {/* Other form fields */}
    </form>
  );
};
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS: Uses native file input with capture attribute
- Android: Uses direct camera access with media stream
- Desktop: Uses direct camera access with media stream

## Accessibility

- Keyboard navigable
- Proper ARIA attributes
- Clear error messages
- Visual indicators for active states 