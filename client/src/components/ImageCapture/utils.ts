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
  
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
    return 'video/webm;codecs=vp9,opus';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
    return 'video/webm;codecs=vp8,opus';
  } else if (MediaRecorder.isTypeSupported('video/webm')) {
    return 'video/webm';
  } else if (MediaRecorder.isTypeSupported('video/mp4')) {
    return 'video/mp4';
  }
  
  return '';
}; 