import React from 'react';

/**
 * Props for the StormwaterForm component
 */
interface StormwaterFormProps {
  /** Stormwater problem location value */
  stormwaterProblemLocation: string;
  /** Stormwater problem type value */
  stormwaterProblemType: string;
  /** Cause of clog value */
  causeOfClog: string;
  /** Handler for input changes */
  onInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Component for displaying stormwater-specific form fields
 * 
 * @param {StormwaterFormProps} props - Component props
 * @returns {JSX.Element} The rendered StormwaterForm component
 */
const StormwaterForm: React.FC<StormwaterFormProps> = ({
  stormwaterProblemLocation,
  stormwaterProblemType,
  causeOfClog,
  onInputChange
}) => {
  return (
    <>
      <h4>Stormwater Infrastructure Problem</h4>
      <label>Location of Problem:</label>
      <select
        name="stormwaterProblemLocation"
        value={stormwaterProblemLocation}
        onChange={onInputChange}
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
        value={stormwaterProblemType}
        onChange={onInputChange}
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
        value={causeOfClog}
        onChange={onInputChange}
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
  );
};

export default StormwaterForm; 