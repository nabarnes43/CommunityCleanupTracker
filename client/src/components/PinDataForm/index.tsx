import React, { useState, useEffect } from 'react';
import './PinDataForm.css';
import { PinDataFormProps, FormType } from '../../types';
import DumpingForm from './DumpingForm';
import StandingWaterForm from './StandingWaterForm';
import StormwaterForm from './StormwaterForm';
import ImageCapture from '../ImageCapture';
// @ts-ignore
import CalendarIcon from '../../img/Calendar.svg';

/**
 * Interface for the form data state
 */
interface FormDataState {
  formType: string;
  typeOfDumping: string;
  locationOfDumping: string;
  amountOfDumping: string;
  standingWaterLocation: string;
  weatherCondition: string;
  presenceOfMold: string;
  stormwaterProblemLocation: string;
  stormwaterProblemType: string;
  causeOfClog: string;
  notes: string;
  moodNotes: string;
  date: string;
  images: File[];
  videos: File[];
}

/**
 * Component for collecting data about a new marker
 * 
 * @param {PinDataFormProps} props - Component props
 * @returns {JSX.Element} The rendered PinDataForm component
 */
const PinDataForm: React.FC<PinDataFormProps> = ({ onSubmit, onCancel }) => {
  // Initialize form state with all needed fields
  const [formData, setFormData] = useState<FormDataState>({
    formType: '',
    typeOfDumping: '',
    locationOfDumping: '',
    amountOfDumping: '',
    standingWaterLocation: '',
    weatherCondition: '',
    presenceOfMold: '',
    stormwaterProblemLocation: '',
    stormwaterProblemType: '',
    causeOfClog: '',
    notes: '',
    moodNotes: '',
    date: '',
    images: [],
    videos: []
  });

  /**
   * Set the current date when component mounts
   */
  useEffect(() => {
    // Format the date as YYYY-MM-DD for the date input
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    setFormData(prevData => ({
      ...prevData,
      date: formattedDate
    }));
  }, []);

  /**
   * Handle changes for text and select inputs
   * 
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e - The change event
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  /**
   * Handle form type selection
   * 
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event
   */
  const handleFormTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prevData => ({
      ...prevData,
      formType: e.target.value
    }));
  };

  /**
   * Unified file upload handler for all media files
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    
    // Separate images and videos
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    // Process images
    if (imageFiles.length > 0) {
      const fileType = 'images';
      console.log(`${fileType} upload:`, imageFiles.length);
      
      // Skip empty files
      const validFiles = imageFiles.filter(file => file.size > 0);
      
      if (validFiles.length === 0) {
        console.warn('No valid image files found after filtering');
      } else {
        const maxFiles = 5; // 5 images
        const maxSize = 10 * 1024 * 1024; // 10MB for images
        
        // Get the current files from state
        const currentFiles = [...formData[fileType]];
        
        // Check if adding these files would exceed the maximum allowed
        if (currentFiles.length + validFiles.length > maxFiles) {
          alert(`You can only upload up to ${maxFiles} images. You already have ${currentFiles.length}.`);
        } else {
          // Define allowed file types
          const validTypes = ['image/jpeg', 'image/png', 'image/gif'];

          // Validate file types
          const invalidFiles = validFiles.filter(file => !validTypes.includes(file.type));
          if (invalidFiles.length > 0) {
            const invalidTypes = invalidFiles.map(f => f.type || 'unknown').join(', ');
            alert(`Unsupported image format: ${invalidTypes}. Please use supported formats.`);
          } else {
            // Validate file sizes
            const oversizedFiles = validFiles.filter(file => file.size > maxSize);
            if (oversizedFiles.length > 0) {
              alert(`Each image must be smaller than ${maxSize / (1024 * 1024)}MB.`);
            } else {
              // Update form data with valid files - append to existing files
              setFormData(prevData => {
                const updatedFiles = [...prevData[fileType], ...validFiles];
                console.log(`Added ${validFiles.length} ${fileType} files. New total: ${updatedFiles.length}`);
                return {
                  ...prevData,
                  [fileType]: updatedFiles
                };
              });
            }
          }
        }
      }
    }
    
    // Process videos
    if (videoFiles.length > 0) {
      const fileType = 'videos';
      console.log(`${fileType} upload:`, videoFiles.length);
      
      // Skip empty files
      const validFiles = videoFiles.filter(file => file.size > 0);
      
      if (validFiles.length === 0) {
        console.warn('No valid video files found after filtering');
      } else {
        const maxFiles = 2; // 2 videos
        const maxSize = 50 * 1024 * 1024; // 50MB for videos
        
        // Get the current files from state
        const currentFiles = [...formData[fileType]];
        
        // Check if adding these files would exceed the maximum allowed
        if (currentFiles.length + validFiles.length > maxFiles) {
          alert(`You can only upload up to ${maxFiles} videos. You already have ${currentFiles.length}.`);
        } else {
          // Define allowed file types
          const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

          // Validate file types
          const invalidFiles = validFiles.filter(file => !validTypes.includes(file.type));
          if (invalidFiles.length > 0) {
            const invalidTypes = invalidFiles.map(f => f.type || 'unknown').join(', ');
            alert(`Unsupported video format: ${invalidTypes}. Please use supported formats.`);
          } else {
            // Validate file sizes
            const oversizedFiles = validFiles.filter(file => file.size > maxSize);
            if (oversizedFiles.length > 0) {
              alert(`Each video must be smaller than ${maxSize / (1024 * 1024)}MB.`);
            } else {
              // Update form data with valid files - append to existing files
              setFormData(prevData => {
                const updatedFiles = [...prevData[fileType], ...validFiles];
                console.log(`Added ${validFiles.length} ${fileType} files. New total: ${updatedFiles.length}`);
                return {
                  ...prevData,
                  [fileType]: updatedFiles
                };
              });
            }
          }
        }
      }
    }
  };

  /**
   * Handle removing a file - adapted for the unified media approach
   * 
   * @param {number} index - The index of the file to remove
   */
  const handleRemoveFile = (index: number) => {
    // Create a combined array of all media
    const allMedia = [...formData.images, ...formData.videos];
    const fileToRemove = allMedia[index];
    
    if (!fileToRemove) {
      console.error(`No file found at index ${index}`);
      return;
    }
    
    // Determine if it's an image or video
    const fileType = fileToRemove.type.startsWith('image/') ? 'images' : 'videos';
    
    // Calculate the correct index in the original array
    let originalIndex;
    if (fileType === 'images') {
      originalIndex = index;
    } else {
      // If it's a video, the index is relative to the videos array
      // which starts after all images
      originalIndex = index - formData.images.length;
    }
    
    console.log(`Removing ${fileType} at original index ${originalIndex}`);
    
    setFormData(prevData => {
      // Create a copy of the current files
      const updatedFiles = [...prevData[fileType]];
      
      // Remove the file at the specified index
      updatedFiles.splice(originalIndex, 1);
      
      console.log(`Removed ${fileType} file. New total: ${updatedFiles.length}`);
      
      // Return the updated state
      return {
        ...prevData,
        [fileType]: updatedFiles
      };
    });
  };

  /**
   * Handle form submission
   * 
   * @param {React.FormEvent<HTMLFormElement>} e - The form event
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Create FormData instance
    const submitData = new FormData();
  
    // Add form fields, only including non-empty values
    Object.entries(formData).forEach(([key, value]) => {
      // Skip file arrays
      if (key !== 'images' && key !== 'videos') {
        // Only append if value exists and isn't empty
        if (value !== undefined && value !== null && value !== '') {
          submitData.append(key, value);
        }
      }
    });
  
    // Filter out any invalid files before adding
    const validImages = formData.images.filter(image => 
      image.size > 0 && ['image/jpeg', 'image/png', 'image/gif'].includes(image.type)
    );
    
    const validVideos = formData.videos.filter(video => 
      video.size > 0 && ['video/mp4', 'video/quicktime', 'video/x-msvideo'].includes(video.type)
    );
    
    // Add files if they exist
    if (validImages.length > 0) {
      validImages.forEach(image => {
        submitData.append('images', image);
      });
    }
  
    if (validVideos.length > 0) {
      validVideos.forEach(video => {
        submitData.append('videos', video);
      });
    }
  
    // Log the actual form data for debugging
    console.log('Form Type:', formData.formType);
    console.log('Notes:', formData.notes);
    console.log('Mood Notes:', formData.moodNotes);
    console.log('Date:', formData.date);
    console.log('Images:', validImages.length);
    console.log('Videos:', validVideos.length);
  
    onSubmit(submitData);
  };

  return (
    <form className="pin-form" onSubmit={handleSubmit}>
      <h3>Enter Pin Details</h3>

      {/* Form Type Selection */}
      <div className="text-input-container">
        <div className="input-header">
          <label>Select Issue Type:</label>
        </div>
        <select 
          className="selector"
          name="formType" 
          value={formData.formType} 
          onChange={handleFormTypeChange} 
          required
        >
          <option value="">Choose Type</option>
          <option value={FormType.DUMPING}>Illegal Dumping</option>
          <option value={FormType.STANDING_WATER}>Standing Water Infrastructure</option>
          <option value={FormType.STORMWATER}>Stormwater Infrastructure Problem</option>
        </select>
      
        {/* Render the appropriate form based on the selected form type */}
        {formData.formType === FormType.DUMPING && (
          <DumpingForm
            typeOfDumping={formData.typeOfDumping}
            locationOfDumping={formData.locationOfDumping}
            amountOfDumping={formData.amountOfDumping}
            onInputChange={handleInputChange}
          />
        )}

        {formData.formType === FormType.STANDING_WATER && (
          <StandingWaterForm
            weatherCondition={formData.weatherCondition}
            standingWaterLocation={formData.standingWaterLocation}
            presenceOfMold={formData.presenceOfMold}
            onInputChange={handleInputChange}
          />
        )}

        {formData.formType === FormType.STORMWATER && (
          <StormwaterForm
            stormwaterProblemLocation={formData.stormwaterProblemLocation}
            stormwaterProblemType={formData.stormwaterProblemType}
            causeOfClog={formData.causeOfClog}
            onInputChange={handleInputChange}
          />
        )}
      </div>

      {/* Replace FileUploadSection with CameraCapture */}
      <ImageCapture
        mediaFiles={[...formData.images, ...formData.videos]}
        onFileUpload={handleFileUpload}
        onRemoveFile={handleRemoveFile}
      />

      {/* Common Fields */}
      <div className="text-input-container">
        <div className="input-header">
          <label>Any Notes or Observations:</label>
        </div>
        <div className="input-field">
          <textarea
            className="input-field-text" // Ensure this class is applied
            name="notes"
            placeholder="Enter some notes"
            maxLength={150}
            value={formData.notes}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <div className="text-input-container">
        <div className="input-header">
          <label>How Does This Observation Make You Feel?:</label>
        </div>
        <div className="input-field">
          <textarea
            className="input-field-text"
            name="moodNotes"
            placeholder="Enter a mood"
            maxLength={150}
            value={formData.moodNotes}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="text-input-container">
        <div className="input-header">
          <label>Date Observed:</label>
        </div>
        <div className="date-input-container">
          <input
            className="date-input"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
          <img src={CalendarIcon} alt="Calendar" className="date-icon" />
        </div>
      </div>

      <button className="form-button" type="submit">Add Pin</button>
      <button className="form-button" type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default PinDataForm; 