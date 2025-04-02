import React, { useState, useEffect } from 'react';
import './PinDataForm.css';
import { PinDataFormProps, FormType } from '../../types';
import DumpingForm from './DumpingForm';
import StandingWaterForm from './StandingWaterForm';
import StormwaterForm from './StormwaterForm';
import CameraCapture from './CameraCapture';

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
   * Unified file upload handler for both images and videos
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   * @param {'images' | 'videos'} fileType - The type of files being uploaded
   */
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: 'images' | 'videos'
  ) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    
    // Log file information for debugging
    console.log(`${fileType} upload:`, files.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size
    })));
    console.log(`Current ${fileType} count:`, formData[fileType].length);
    
    // Skip empty files
    const validFiles = files.filter(file => file.size > 0);
    
    // If no valid files after filtering, exit early
    if (validFiles.length === 0) {
      console.warn('No valid files found after filtering');
      return;
    }
    
    // Filter files to match the requested type
    const typeFilteredFiles = validFiles.filter(file => {
      if (fileType === 'images') {
        return file.type.startsWith('image/');
      } else {
        return file.type.startsWith('video/');
      }
    });
    
    // If no files match the requested type, exit early
    if (typeFilteredFiles.length === 0) {
      console.warn(`No ${fileType} found in the selected files`);
      return;
    }
    
    const maxFiles = fileType === 'images' ? 5 : 2; // 5 images or 2 videos
    const maxSize = fileType === 'images' ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB for images, 50MB for videos
    
    // Get the current files from state to ensure we have the latest count
    const currentFiles = [...formData[fileType]];
    console.log(`Current ${fileType} in state:`, currentFiles.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size
    })));
    
    // Filter out duplicates
    const uniqueFiles = typeFilteredFiles.filter(newFile => {
      // For images, check exact matches
      if (fileType === 'images') {
        const isDuplicate = currentFiles.some(existingFile => 
          existingFile.name === newFile.name && 
          existingFile.size === newFile.size && 
          existingFile.type === newFile.type
        );
        
        if (isDuplicate) {
          console.log(`Skipping duplicate image: ${newFile.name}`);
        }
        
        return !isDuplicate;
      } 
      // For videos, use a more robust check
      else {
        // First check exact matches
        let isDuplicate = currentFiles.some(existingFile => {
          const exactMatch = existingFile.name === newFile.name && 
                            existingFile.size === newFile.size && 
                            existingFile.type === newFile.type;
          
          if (exactMatch) {
            console.log(`Found exact duplicate video: ${newFile.name}`);
          }
          
          return exactMatch;
        });
        
        // If not an exact match, check if we have a video with similar size (within 5%)
        if (!isDuplicate && currentFiles.length > 0) {
          isDuplicate = currentFiles.some(existingFile => {
            // Check if file sizes are within 5% of each other
            const sizeDifference = Math.abs(existingFile.size - newFile.size);
            const sizePercentage = sizeDifference / Math.max(existingFile.size, newFile.size);
            const isSimilarSize = sizePercentage < 0.05 && existingFile.type === newFile.type;
            
            if (isSimilarSize) {
              console.log(`Found similar video by size: ${newFile.name} vs ${existingFile.name}`, {
                sizeDifference,
                sizePercentage,
                newFileSize: newFile.size,
                existingFileSize: existingFile.size
              });
            }
            
            return isSimilarSize;
          });
        }
        
        if (isDuplicate) {
          console.log(`Skipping duplicate video: ${newFile.name}`);
        } else {
          console.log(`Adding new unique video: ${newFile.name}`);
        }
        
        return !isDuplicate;
      }
    });
    
    // If all files were duplicates, exit early
    if (uniqueFiles.length === 0) {
      console.warn('All files were duplicates, nothing to add');
      return;
    }
    
    console.log(`Unique ${fileType} to add:`, uniqueFiles.length);
    
    // Check if adding these files would exceed the maximum allowed
    if (currentFiles.length + uniqueFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} ${fileType}. You already have ${currentFiles.length}.`);
      return;
    }
    
    // Define allowed file types
    const validTypes = fileType === 'images' 
      ? ['image/jpeg', 'image/png', 'image/gif']
      : ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

    // Validate file types
    const invalidFiles = uniqueFiles.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      const invalidTypes = invalidFiles.map(f => f.type || 'unknown').join(', ');
      alert(`Unsupported ${fileType.slice(0, -1)} format: ${invalidTypes}. Please use supported formats.`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = uniqueFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert(`Each ${fileType.slice(0, -1)} must be smaller than ${maxSize / (1024 * 1024)}MB.`);
      return;
    }

    // Update form data with valid files - append to existing files
    setFormData(prevData => {
      // Make sure we're working with the latest state
      const updatedFiles = [...prevData[fileType], ...uniqueFiles];
      
      // Double-check we're not exceeding the limit (defensive programming)
      if (updatedFiles.length > maxFiles) {
        console.warn(`Attempted to add too many ${fileType}, truncating to ${maxFiles}`);
        const truncatedFiles = updatedFiles.slice(0, maxFiles);
        console.log(`Added ${truncatedFiles.length - prevData[fileType].length} ${fileType} files. New total: ${truncatedFiles.length}`);
        return {
          ...prevData,
          [fileType]: truncatedFiles
        };
      }
      
      console.log(`Added ${uniqueFiles.length} ${fileType} files. New total: ${updatedFiles.length}`);
      return {
        ...prevData,
        [fileType]: updatedFiles
      };
    });
  };

  /**
   * Handle removing a file
   * 
   * @param {'images' | 'videos'} fileType - The type of file to remove
   * @param {number} index - The index of the file to remove
   */
  const handleRemoveFile = (fileType: 'images' | 'videos', index: number) => {
    console.log(`Removing ${fileType} at index ${index}`);
    
    setFormData(prevData => {
      // Create a copy of the current files
      const updatedFiles = [...prevData[fileType]];
      
      // Remove the file at the specified index
      updatedFiles.splice(index, 1);
      
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
      <CameraCapture
        images={formData.images}
        videos={formData.videos}
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
        <div className="input-field">
          <input
            className="input-field-text"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <button className="form-button" type="submit">Add Pin</button>
      <button className="form-button" type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default PinDataForm; 