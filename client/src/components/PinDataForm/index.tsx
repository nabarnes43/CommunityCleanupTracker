import React, { useState } from 'react';
import './PinDataForm.css';
import { PinDataFormProps, FormType } from '../../types';
import DumpingForm from './DumpingForm';
import StandingWaterForm from './StandingWaterForm';
import StormwaterForm from './StormwaterForm';
import FileUploadSection from './FileUploadSection';

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
    const maxFiles = fileType === 'images' ? 5 : 2; // 5 images or 2 videos
    const maxSize = fileType === 'images' ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB for images, 50MB for videos
    
    // Validate number of files
    if (files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} ${fileType}.`);
      return;
    }

    // Define allowed file types
    const validTypes = fileType === 'images' 
      ? ['image/jpeg', 'image/png', 'image/gif']
      : ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

    // Validate file types
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      alert(`Please upload only supported ${fileType} formats.`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert(`Each ${fileType.slice(0, -1)} must be smaller than ${maxSize / (1024 * 1024)}MB.`);
      return;
    }

    // Update form data with valid files
    setFormData(prevData => ({
      ...prevData,
      [fileType]: files
    }));
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
  
    // Add files if they exist
    if (formData.images.length > 0) {
      formData.images.forEach(image => {
        submitData.append('images', image);
      });
    }
  
    if (formData.videos.length > 0) {
      formData.videos.forEach(video => {
        submitData.append('videos', video);
      });
    }
  
    // Log the actual form data for debugging
    console.log('Form Type:', formData.formType);
    console.log('Notes:', formData.notes);
    console.log('Mood Notes:', formData.moodNotes);
    console.log('Date:', formData.date);
    console.log('Images:', formData.images.length);
    console.log('Videos:', formData.videos.length);
  
    onSubmit(submitData);
  };

  return (
    <form className="pin-form" onSubmit={handleSubmit}>
      <h3>Enter Pin Details</h3>

      {/* Form Type Selection */}
      <label>Select Form Type:</label>
      <select 
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

      {/* File Upload Section */}
      <FileUploadSection
        images={formData.images}
        videos={formData.videos}
        onFileUpload={handleFileUpload}
      />

      {/* Common Fields */}
      <label>Any Notes or Observations:</label>
      <textarea
        name="notes"
        placeholder="Enter some notes"
        maxLength={150}
        value={formData.notes}
        onChange={handleInputChange}
      />

      <label>How Does This Observation Make You Feel?:</label>
      <textarea
        name="moodNotes"
        placeholder="Enter a mood"
        maxLength={150}
        value={formData.moodNotes}
        onChange={handleInputChange}
      />

      <label>Date Observed:</label>
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleInputChange}
        required
      />

      <button type="submit">Add Pin</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default PinDataForm; 