/**
 * Type definitions for the ImageCapture component
 */

import { MutableRefObject } from 'react';

/**
 * Props interface for the ImageCapture component
 */
export interface ImageCaptureProps {
  /** Callback function when images or videos are captured */
  onImageCapture: (files: File[] | null) => void;
  /** Default image to display */
  defaultImage?: string;
  /** Allow multiple files to be selected */
  allowMultiple?: boolean;
  /** Custom text for the capture button */
  captureButtonText?: string;
  /** Custom text for the gallery button */
  galleryButtonText?: string;
  /** Allow video recording in addition to images */
  allowVideo?: boolean;
  /** Maximum video duration in seconds */
  maxVideoDurationSeconds?: number;
  /** Show preview of captured media */
  showPreview?: boolean;
  /** Enable download button in preview */
  enableDownload?: boolean;
}

/**
 * Captured media file with additional metadata
 */
export interface CapturedMedia {
  /** The captured file */
  file: File;
  /** The type of media (image or video) */
  type: 'image' | 'video';
  /** Preview URL for the media */
  previewUrl: string;
}

/**
 * Error interface for media errors
 */
export interface MediaError {
  message: string;
  name?: string;
}

/**
 * Props for the CameraPreview component
 */
export interface CameraPreviewProps {
  stream: MediaStream | null;
  isRecording: boolean;
  recordingTime: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  onError: (error: string) => void;
}

/**
 * Props for the CameraControls component
 */
export interface CameraControlsProps {
  isCameraActive: boolean;
  isRecording: boolean;
  isVideoMode: boolean;
  allowVideo: boolean;
  captureButtonText: string;
  galleryButtonText: string;
  toggleCamera: () => void;
  handleVideoAction: () => void;
  toggleMode: () => void;
  stopCamera: () => void;
  openFileSelection: () => void;
}

/**
 * Props for the IOSControls component
 */
export interface IOSControlsProps {
  isVideoMode: boolean;
  captureButtonText: string;
  galleryButtonText: string;
  allowVideo: boolean;
  openFileSelection: () => void;
  toggleMode: () => void;
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
}

/**
 * Props for the ErrorHelp component
 */
export interface ErrorHelpProps {
  error: string | null;
  openFileSelection: () => void;
}

/**
 * Props for the MediaPreview component
 */
export interface MediaPreviewProps {
  capturedMedia: CapturedMedia[];
  onRemove: (index: number) => void;
  onDownload?: (index: number) => void;
} 