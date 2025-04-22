import React from 'react';
import { Marker, FormType } from '../types';

/**
 * Configuration object that defines display settings for each form type
 */
export const formTypeConfig: Record<string, { 
  title: string, 
  shortTitle: string,
  fields: Array<{ 
    label: string, 
    key: string, 
    shortLabel?: string,
    transform?: (value: any) => string 
  }>
}> = {
  [FormType.DUMPING]: {
    title: 'Dumping Details:',
    shortTitle: 'Illegal Dumping:',
    fields: [
      { label: 'Type Of Dumping', key: 'typeOfDumping', shortLabel: 'Type' },
      { label: 'Location Of Dumping', key: 'locationOfDumping', shortLabel: 'Location' },
      { label: 'Amount Of Dumping', key: 'amountOfDumping', shortLabel: 'Amount' }
    ]
  },
  [FormType.STANDING_WATER]: {
    title: 'Standing Water Details:',
    shortTitle: 'Standing Water:',
    fields: [
      { label: 'Standing Water Location', key: 'standingWaterLocation', shortLabel: 'Location' },
      { label: 'Weather Condition', key: 'weatherCondition', shortLabel: 'Weather' },
      { label: 'Presence Of Mold', key: 'presenceOfMold', shortLabel: 'Mold Present', transform: (value) => value ? 'Yes' : 'No' }
    ]
  },
  [FormType.STORMWATER]: {
    title: 'Stormwater Details:',
    shortTitle: 'Stormwater Issue:',
    fields: [
      { label: 'Problem Type', key: 'stormwaterProblemType', shortLabel: 'Issue' },
      { label: 'Problem Location', key: 'stormwaterProblemLocation', shortLabel: 'Location' },
      { label: 'Cause Of Clog', key: 'causeOfClog', shortLabel: 'Cause' }
    ]
  }
};

/**
 * Renders detailed form-specific information for the PinDetails view
 * 
 * @param {Marker} pin - The pin/marker data
 * @returns {JSX.Element | null} The form details section or null if form type not recognized
 */
export const renderFormTypeDetails = (pin: Marker): JSX.Element | null => {
  const config = formTypeConfig[pin.formType];
  if (!config) return null;

  return (
    <div className="pin-details-item">
      <h3>{config.title}</h3>
      <div className="pin-details-section">
        {config.fields.map((field, index) => (
          <div className="pin-details-row" key={index}>
            <span className="pin-details-label">{field.label}</span>
            <span className="pin-details-sub-label">
              {field.transform 
                ? field.transform(pin.details?.[field.key]) 
                : (pin.details?.[field.key] || 'N/A')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Renders a summarized description of the form data for the PinList view
 * 
 * @param {Marker} marker - The marker data to display
 * @returns {JSX.Element} The formatted description
 */
export const renderMarkerDescription = (marker: Marker): JSX.Element => {
  const config = formTypeConfig[marker.formType];
  
  if (!config) {
    return <span className="issue-type">{marker.formType || 'Unknown Issue'}</span>;
  }
  
  return (
    <div className="description-content">
      <span className="issue-type">{config.shortTitle}</span>
      <div className="issue-details">
        {config.fields.map((field, index) => 
          marker.details?.[field.key] ? (
            <span key={index}>
              <strong>{field.shortLabel || field.label}:</strong> 
              {field.transform 
                ? field.transform(marker.details[field.key]) 
                : marker.details[field.key]
              }
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}; 