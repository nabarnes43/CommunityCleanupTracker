import React, { useState } from 'react';
import './PinDataForm.css';

const PinDataForm = ({ onSubmit, onCancel }) => {
  // Initialize form state with all needed fields
  const [formData, setFormData] = useState({
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

  // Handle changes for text and select inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form type selection
  const handleFormTypeChange = (e) => {
    setFormData(prevData => ({
      ...prevData,
      formType: e.target.value
    }));
  };

  // Unified file upload handler for both images and videos
  const handleFileUpload = (e, fileType) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create FormData instance
    const submitData = new FormData();
  
    // Add location data if available
    if (window.userLocation) {
      submitData.append('location', JSON.stringify({
        latitude: window.userLocation[0],
        longitude: window.userLocation[1]
      }));
    }
  
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
        <option value="Dumping">Illegal Dumping</option>
        <option value="StandingWater">Standing Water Infrastructure</option>
        <option value="Stormwater">Stormwater Infrastructure Problem</option>
      </select>

      {/* Dumping Form Fields */}
      {formData.formType === 'Dumping' && (
        <>
          <h4>Illegal Dumping Details</h4>
          <label>Type of Illegal Dumping:</label>
          <select
            name="typeOfDumping"
            value={formData.typeOfDumping}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Type</option>
            <option value="Sewage/floatable solid">Sewage/floatable solid</option>
            <option value="Construction debris">Construction or building materials debris</option>
            <option value="Housing debris">Housing debris (couches, mattresses, furniture)</option>
            <option value="Scrap tire debris">Scrap tire debris</option>
            <option value="Assorted debris">Assorted debris</option>
            <option value="Other">Other</option>
          </select>

          <label>Location of Illegal Dumping:</label>
          <select
            name="locationOfDumping"
            value={formData.locationOfDumping}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Location</option>
            <option value="Vacant lot">Vacant lot</option>
            <option value="Public street">Public street</option>
            <option value="Public sidewalk">Public sidewalk</option>
            <option value="Public park">Public park</option>
            <option value="Other">Other</option>
          </select>

          <label>Amount of Illegal Dumping:</label>
          <select
            name="amountOfDumping"
            value={formData.amountOfDumping}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Amount</option>
            <option value="Isolated (less than 10 items)">Isolated (less than 10 items)</option>
            <option value="Moderate (11-50 items)">Moderate (11-50 items)</option>
            <option value="Widespread (more than 50 items)">Widespread (more than 50 items)</option>
          </select>
        </>
      )}

      {/* Standing Water Form Fields */}
      {formData.formType === 'StandingWater' && (
        <>
          <h4>Standing Water Infrastructure Details</h4>
          <label>Current Weather Conditions:</label>
          <select
            name="weatherCondition"
            value={formData.weatherCondition}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Condition</option>
            <option value="Raining right now">Raining right now</option>
            <option value="Not raining right now">Not raining right now</option>
            <option value="Rained within last 48 hours">Not raining now, but rained within last 48 hours</option>
          </select>

          <label>Location of Standing Water:</label>
          <select
            name="standingWaterLocation"
            value={formData.standingWaterLocation}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Location</option>
            <option value="Vacant lot">Vacant lot</option>
            <option value="Public street">Public street</option>
            <option value="Public park">Public park</option>
            <option value="Occupied building">Occupied business or commercial building</option>
            <option value="Other">Other</option>
          </select>

          <label>Presence of Mold:</label>
          <select
            name="presenceOfMold"
            value={formData.presenceOfMold}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Presence</option>
            <option value="Visible evidence">Visible evidence of mold</option>
            <option value="Damp smell">Smell of damp, moldy condition</option>
            <option value="Both">Both visible evidence and smell of mold</option>
            <option value="None">None</option>
          </select>
        </>
      )}

      {/* Stormwater Form Fields */}
      {formData.formType === 'Stormwater' && (
        <>
          <h4>Stormwater Infrastructure Problem</h4>
          <label>Location of Problem:</label>
          <select
            name="stormwaterProblemLocation"
            value={formData.stormwaterProblemLocation}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Location</option>
            <option value="Vacant lot">Vacant lot</option>
            <option value="Public street">Public street</option>
            <option value="Public sidewalk">Public sidewalk</option>
            <option value="Public park">Public park</option>
            <option value="Occupied single family home">Occupied single family home</option>
            <option value="Unoccupied single family home">Unoccupied single family home</option>
            <option value="Occupied apartment complex">Occupied apartment complex or other complex</option>
            <option value="Unoccupied apartment complex">Unoccupied apartment complex or other complex</option>
            <option value="Occupied commercial building">Occupied business or commercial building</option>
            <option value="Unoccupied commercial building">Unoccupied business or commercial building</option>
            <option value="Other">Other</option>
          </select>

          <label>Type of Problem:</label>
          <select
            name="stormwaterProblemType"
            value={formData.stormwaterProblemType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Type</option>
            <option value="Clogged storm drain">Clogged storm drain</option>
            <option value="Clogged stormwater pipe">Clogged stormwater pipe</option>
            <option value="Collapsed stormwater drain">Collapsed stormwater drain</option>
            <option value="Sinkhole or depression">Sinkhole or depression</option>
            <option value="Other">Other</option>
          </select>

          <label>Cause of Clog:</label>
          <select
            name="causeOfClog"
            value={formData.causeOfClog}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Cause</option>
            <option value="Dirt or leaves">Dirt or leaves</option>
            <option value="Trash">Trash</option>
            <option value="Combination of dirt, leaves, or trash">Combination of dirt, leaves, or trash</option>
            <option value="Tree roots">Tree roots</option>
            <option value="Other">Other</option>
          </select>
        </>
      )}

      {/* File Upload Section */}
      <div className="file-upload-section">
        <div className="upload-group">
          <label>Upload Images (up to 5):</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            multiple
            onChange={(e) => handleFileUpload(e, 'images')}
          />
          <div className="preview-container">
            {formData.images.map((image, index) => (
              <div key={`img-${index}`} className="preview-item">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                  className="image-thumbnail"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="upload-group">
          <label>Upload Videos (up to 2):</label>
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideo"
            multiple
            onChange={(e) => handleFileUpload(e, 'videos')}
          />
          <div className="preview-container">
            {formData.videos.map((video, index) => (
              <div key={`vid-${index}`} className="preview-item">
                <video
                  src={URL.createObjectURL(video)}
                  className="video-thumbnail"
                  controls
                  width="200"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Common Fields */}
      <label>Any Notes or Observations:</label>
      <textarea
        name="notes"
        placeholder="Enter some notes"
        maxLength="150"
        value={formData.notes}
        onChange={handleInputChange}
      />

      <label>How Does This Observation Make You Feel?:</label>
      <textarea
        name="moodNotes"
        placeholder="Enter a mood"
        maxLength="150"
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