/**
 * Utility functions for platform detection and camera operations
 */

/**
 * Detects if the current device is running iOS
 * @returns {boolean} True if the device is running iOS
 */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

/**
 * Detects if the current device is running macOS
 * @returns {boolean} True if the device is running macOS
 */
export const isMacOS = (): boolean => {
  return /Mac/.test(navigator.userAgent);
};

/**
 * Detects if the current device is a mobile device (iOS or Android)
 * @returns {boolean} True if the device is a mobile device
 */
export const isMobile = (): boolean => {
  // Check for iOS devices
  const isIOSDevice = isIOS();
  
  // Check for Android devices
  const isAndroidDevice = /Android/.test(navigator.userAgent);
  
  // Check for general mobile indicators
  const hasMobileKeywords = /Mobile|iPhone|Android|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check screen dimensions as an additional heuristic
  const hasSmallScreen = window.innerWidth <= 768;
  
  return isIOSDevice || isAndroidDevice || (hasMobileKeywords && hasSmallScreen);
};

/**
 * Detects if the current device is a desktop computer
 * @returns {boolean} True if the device is a desktop computer
 */
export const isDesktop = (): boolean => {
  return !isMobile();
};

/**
 * Formats recording time as MM:SS
 * @param {number} seconds - The recording time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Finds the best supported MIME type for video recording
 * @returns {string} The best supported MIME type or empty string if none found
 */
export const getBestVideoMimeType = (): string => {
  if (typeof MediaRecorder === 'undefined') {
    return '';
  }
  
  // Try MP4 first for better compatibility
  if (MediaRecorder.isTypeSupported('video/mp4')) {
    return 'video/mp4';
  } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264')) {
    return 'video/mp4;codecs=h264';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
    return 'video/webm;codecs=vp9,opus';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
    return 'video/webm;codecs=vp8,opus';
  } else if (MediaRecorder.isTypeSupported('video/webm')) {
    return 'video/webm';
  }
  
  // Fallback to default
  return 'video/mp4';
};

/**
 * Checks if a video format is supported for playback
 * @param {string} mimeType - The MIME type to check
 * @returns {boolean} True if the format is supported
 */
export const isVideoFormatSupported = (mimeType: string): boolean => {
  // Create a video element to test format support
  const video = document.createElement('video');
  
  // Check if the browser can play this type
  return video.canPlayType(mimeType) !== '';
}; 