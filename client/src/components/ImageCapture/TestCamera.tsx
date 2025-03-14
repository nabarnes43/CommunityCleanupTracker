import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, StopCircle } from 'lucide-react';

// Define TypeScript interfaces
interface MediaError {
  message: string;
  name?: string;
}

/**
 * Component that provides camera functionality for capturing photos and recording videos
 * @returns {JSX.Element} The rendered camera component
 */
const CameraComponent: React.FC = () => {
  // State for managing camera stream and media data
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for DOM elements and recording
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  // Initialize camera stream on component mount
  useEffect(() => {
    const initCamera = async (): Promise<void> => {
      try {
        const mediaStream: MediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        const error = err as MediaError;
        setError("Camera access denied or not available");
        console.error("Error accessing camera:", error.message);
      }
    };
    
    initCamera();
    
    // Cleanup function to stop all media streams when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, []);
  
  // Function to capture a photo
  const takePhoto = (): void => {
    if (!videoRef.current || !stream) return;
    
    try {
      // Create a canvas element to capture the current video frame
      const canvas: HTMLCanvasElement = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (!ctx) {
        setError("Failed to get canvas context");
        return;
      }
      
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const photoDataUrl: string = canvas.toDataURL('image/jpeg');
      setCapturedPhoto(photoDataUrl);
      setRecordedVideo(null); // Clear any previous recorded video
    } catch (err) {
      const error = err as MediaError;
      setError("Failed to capture photo");
      console.error("Error taking photo:", error.message);
    }
  };
  
  // Function to start/stop video recording
  const toggleRecording = (): void => {
    if (!stream || !videoRef.current) return;
    
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    } else {
      // Start new recording
      setCapturedPhoto(null); // Clear any previous photo
      setRecordedVideo(null);
      recordedChunksRef.current = [];
      
      try {
        const mediaRecorder: MediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event: BlobEvent): void => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = (): void => {
          // Create a blob from recorded chunks
          const videoBlob: Blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const videoUrl: string = URL.createObjectURL(videoBlob);
          setRecordedVideo(videoUrl);
          setIsRecording(false);
        };
        
        // Start recording
        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
      } catch (err) {
        const error = err as MediaError;
        setError("Failed to start recording");
        console.error("Error starting recording:", error.message);
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center p-4 max-w-lg mx-auto bg-gray-50 rounded-lg shadow-md">
      {/* Error message */}
      {error && (
        <div className="w-full p-3 mb-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Camera preview */}
      <div className="relative w-full bg-black rounded-lg overflow-hidden mb-4">
        <video 
          ref={videoRef}
          className="w-full h-64 object-cover"
          autoPlay
          muted
          playsInline
        />
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-2 right-2 flex items-center bg-black bg-opacity-50 p-1 rounded-full">
            <div className="w-3 h-3 bg-red-600 rounded-full mr-1 animate-pulse"></div>
            <span className="text-white text-xs">REC</span>
          </div>
        )}
      </div>
      
      {/* Camera controls */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={takePhoto}
          disabled={isRecording}
          className={`p-3 rounded-full ${
            isRecording 
              ? 'bg-gray-300 text-gray-500' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          aria-label="Take photo"
        >
          <Camera size={24} aria-hidden="true" />
        </button>
        
        <button
          onClick={toggleRecording}
          className={`p-3 rounded-full ${
            isRecording 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? 
            <StopCircle size={24} aria-hidden="true" /> : 
            <Video size={24} aria-hidden="true" />
          }
        </button>
      </div>
      
      {/* Display captured media */}
      <div className="w-full">
        {capturedPhoto && (
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Captured Photo</h3>
            <img 
              src={capturedPhoto} 
              alt="Captured" 
              className="w-full rounded-lg border border-gray-200"
            />
          </div>
        )}
        
        {recordedVideo && (
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Recorded Video</h3>
            <video 
              src={recordedVideo} 
              className="w-full rounded-lg border border-gray-200" 
              controls
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Export the component
export default CameraComponent;