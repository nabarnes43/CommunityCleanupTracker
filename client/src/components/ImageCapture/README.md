# Simple Media Upload Component

A set of components for selecting and previewing images and videos.

## Components

### ImageCapture

The main component that integrates file selection and preview. It provides a UI for selecting and managing media files.

#### Props

- `mediaFiles`: Array of media files (images and videos)
- `onFileUpload`: Handler for file uploads
- `onRemoveFile`: Handler for removing files

### SimpleFileSelector

A reusable file selector button component.

#### Props

- `accept`: File types to accept (e.g., "image/*,video/*")
- `label`: Button label text
- `icon`: Icon component to display
- `onFileSelect`: Handler for file selection events
- `buttonClassName` (optional): Additional CSS class for the button

### SimpleMediaPreview

Component to display previews of selected media files.

#### Props

- `mediaFiles`: Array of media files (images and videos)
- `onRemoveFile`: Handler for removing files

## Usage Example

```tsx
import React, { useState } from 'react';
import ImageCapture from './components/ImageCapture';

const YourComponent = () => {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <ImageCapture
      mediaFiles={mediaFiles}
      onFileUpload={handleFileUpload}
      onRemoveFile={handleRemoveFile}
    />
  );
};
```

## Features

- Single selector for both images and videos
- Preview for all media types
- Counts for different types of media
- Maximum limits (5 images, 2 videos)

## Demo

There's a demo component available at `SimpleFileSelectorDemo.tsx` that showcases the component's functionality.