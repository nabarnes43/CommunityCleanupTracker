import React from 'react';

/**
 * Props for the StandingWaterForm component
 */
interface StandingWaterFormProps {
  /** Weather condition value */
  weatherCondition: string;
  /** Standing water location value */
  standingWaterLocation: string;
  /** Presence of mold value */
  presenceOfMold: string;
  /** Handler for input changes */
  onInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Component for displaying standing water-specific form fields
 * 
 * @param {StandingWaterFormProps} props - Component props
 * @returns {JSX.Element} The rendered StandingWaterForm component
 */
const StandingWaterForm: React.FC<StandingWaterFormProps> = ({
  weatherCondition,
  standingWaterLocation,
  presenceOfMold,
  onInputChange
}) => {
  return (
    <>
      <h4>Standing Water Infrastructure Details</h4>
      <label>Current Weather Conditions:</label>
      <select
        name="weatherCondition"
        value={weatherCondition}
        onChange={onInputChange}
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
        value={standingWaterLocation}
        onChange={onInputChange}
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
        value={presenceOfMold}
        onChange={onInputChange}
        required
      >
        <option value="">Select Presence</option>
        <option value="Visible evidence">Visible evidence of mold</option>
        <option value="Damp smell">Smell of damp, moldy condition</option>
        <option value="Both">Both visible evidence and smell of mold</option>
        <option value="None">None</option>
      </select>
    </>
  );
};

export default StandingWaterForm; 