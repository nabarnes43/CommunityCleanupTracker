import React, { useState } from 'react';
import './PinDataForm.css';

const PinDataForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    formType: '', // Determines the selected form type
    typeOfDumping: '',
    locationOfDumping: '',
    amountOfDumping: '',
    standingWaterLocation: '',
    weatherCondition: '',
    presenceOfMold: '',
    stormwaterProblemLocation: '',
    notes: '',
    moodNotes: '',
    date: '',
    images: [], // Array to store image files
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormTypeChange = (e) => {
    setFormData({ ...formData, formType: e.target.value });
  };

  const handleSubmit = (e) => {
    console.log('Form submitted', formData); // Log to confirm form submission

    e.preventDefault();
    onSubmit(formData);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("You can only upload up to 5 images.");
      return;
    }
    setFormData((prevData) => ({
      ...prevData,
      images: files,
    }));
  };


  return (
    <form className="pin-form" onSubmit={handleSubmit}>
      <h3>Enter Pin Details</h3>

      {/* Form Type Selection */}
      <label>Select Form Type:</label>
      <select name="formType" value={formData.formType} onChange={handleFormTypeChange} required>
        <option value="">Choose Type</option>
        <option value="Dumping">Illegal Dumping</option>
        <option value="StandingWater">Standing Water Infrastructure</option>
        <option value="Stormwater">Stormwater Infrastructure Problem</option>
      </select>


      {/* Conditional Fields for Dumping */}
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

          <br />
        </>
      )}

      {/* Conditional Fields for Standing Water */}
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

          <br />
        </>
      )}

      {/* Conditional Fields for Stormwater Infrastructure Problem */}
      {formData.formType === 'Stormwater' && (
         <>
         <h4>Stormwater Infrastructure Problem</h4>
     
         {/* Location of Problem */}
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
     
         {/* Type of Problem */}
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
     
         {/* Cause of Clog */}
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

      {/* File Upload for Images */}
      <label>Upload Images (up to 5):</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
      />

      {/* Preview Selected Images */}
      <div className="image-preview">
        {formData.images.length > 0 && formData.images.map((image, index) => (
          <img
            key={index}
            src={URL.createObjectURL(image)}
            alt={`Preview ${index + 1}`}
            className="image-thumbnail"
          />
        ))}
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
