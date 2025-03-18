import { getBestVideoMimeType } from './utils';

/**
 * Service class for camera operations
 * 
 * Handles camera initialization, image capture, and video recording
 */
export class CameraService {
  /**
   * Starts the camera by requesting user media
   * 
   * @param {boolean} withAudio - Whether to request audio access
   * @returns {Promise<MediaStream>} The media stream
   * @throws {Error} If camera access fails
   */
  static async startCamera(withAudio: boolean = false): Promise<MediaStream> {
    console.log('Starting camera with audio:', withAudio);
    
    // Check if mediaDevices API is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API not supported in this browser');
    }
    
    try {
      // First try with lower resolution for better compatibility
      const constraints = {
        video: {
          facingMode: 'user', // Prefer front camera
          width: { ideal: 640 }, // Start with lower resolution
          height: { ideal: 480 },
        },
        audio: withAudio, // Only request audio for video recording
      };
      
      console.log('Requesting camera with constraints:', JSON.stringify(constraints));
      
      // Request camera access
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.error('Camera access error:', err);
      
      // Try with basic constraints as fallback
      if (err instanceof DOMException && err.name === 'OverconstrainedError') {
        try {
          console.log('Trying fallback with basic constraints');
          return await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: withAudio,
          });
        } catch (fallbackErr) {
          console.error('Fallback camera access failed:', fallbackErr);
        }
      }
      
      // Re-throw the error for handling by the component
      throw err;
    }
  }

  /**
   * Captures an image from a video element
   * 
   * @param {HTMLVideoElement} videoElement - The video element to capture from
   * @returns {Promise<File>} The captured image as a File
   * @throws {Error} If capture fails
   */
  static async captureImage(videoElement: HTMLVideoElement): Promise<File> {
    console.log('Capturing image from video element');
    
    // Verify video is actually playing and has dimensions
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      console.warn('Video dimensions are zero');
      throw new Error('Camera stream not ready yet. Please wait a moment and try again.');
    }
    
    // Create a canvas element to capture the current frame
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    // Draw the current video frame to canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Clear the canvas first
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Try JPEG format first (most compatible)
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.95);
      });
      
      if (blob && blob.size > 0) {
        console.log('Successfully created JPEG blob, size:', blob.size);
        
        // Create a File object from the blob with explicit MIME type
        return new File([blob], `image-${Date.now()}.jpg`, { 
          type: 'image/jpeg',
          lastModified: Date.now()
        });
      }
    } catch (err) {
      console.warn('Failed to capture as JPEG:', err);
    }
    
    // Try PNG as fallback
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });
      
      if (blob && blob.size > 0) {
        console.log('Successfully created PNG blob, size:', blob.size);
        
        // Create a File object from the blob with explicit MIME type
        return new File([blob], `image-${Date.now()}.png`, { 
          type: 'image/png',
          lastModified: Date.now()
        });
      }
    } catch (err) {
      console.warn('Failed to capture as PNG:', err);
    }
    
    // If all formats fail, try data URL as last resort
    try {
      const dataURL = canvas.toDataURL('image/jpeg', 0.95);
      if (dataURL && dataURL !== 'data:,') {
        // Convert data URL to Blob
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = 'image/jpeg'; // Force JPEG MIME type
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeString });
        return new File([blob], `image-${Date.now()}.jpg`, { 
          type: mimeString,
          lastModified: Date.now()
        });
      }
    } catch (dataUrlError) {
      console.warn('Failed to use dataURL fallback:', dataUrlError);
    }
    
    throw new Error('Failed to capture image in any supported format');
  }

  /**
   * Creates a MediaRecorder for video recording
   * 
   * @param {MediaStream} stream - The media stream to record
   * @returns {MediaRecorder} The media recorder instance
   * @throws {Error} If MediaRecorder is not supported
   */
  static createMediaRecorder(stream: MediaStream): MediaRecorder {
    // Check if MediaRecorder is supported
    if (typeof MediaRecorder === 'undefined') {
      throw new Error('Video recording is not supported in this browser');
    }
    
    // Find supported MIME type
    const mimeType = getBestVideoMimeType();
    
    // Create MediaRecorder instance
    const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
    return new MediaRecorder(stream, options);
  }

  /**
   * Creates a File from recorded chunks
   * 
   * @param {BlobPart[]} recordedChunks - The recorded data chunks
   * @param {string} mimeType - The MIME type of the recording
   * @returns {File} The recorded video as a File
   */
  static createVideoFile(recordedChunks: BlobPart[], mimeType: string = ''): File {
    // Ensure we have valid chunks
    if (!recordedChunks || recordedChunks.length === 0) {
      throw new Error('No video data available');
    }
    
    // Use MP4 as default format for better compatibility
    const defaultMimeType = 'video/mp4';
    
    // Determine file extension based on MIME type
    let fileExtension = 'mp4'; // Default to mp4
    let finalMimeType = mimeType || defaultMimeType;
    
    // Map MIME types to extensions
    if (mimeType.startsWith('video/webm')) {
      fileExtension = 'webm';
    } else if (mimeType.startsWith('video/quicktime')) {
      fileExtension = 'mov';
    } else if (mimeType.startsWith('video/x-msvideo')) {
      fileExtension = 'avi';
    }
    
    // Create a blob from recorded chunks
    const recordedBlob = new Blob(recordedChunks, {
      type: finalMimeType,
    });
    
    // Verify blob size
    if (recordedBlob.size === 0) {
      throw new Error('Created video has no data');
    }
    
    // Create a File object from the blob
    return new File([recordedBlob], `video-${Date.now()}.${fileExtension}`, {
      type: finalMimeType,
    });
  }
} 