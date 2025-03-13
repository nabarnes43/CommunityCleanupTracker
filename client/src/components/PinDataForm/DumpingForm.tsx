import React from 'react';

/**
 * Props for the DumpingForm component
 */
interface DumpingFormProps {
  /** Type of dumping value */
  typeOfDumping: string;
  /** Location of dumping value */
  locationOfDumping: string;
  /** Amount of dumping value */
  amountOfDumping: string;
  /** Handler for input changes */
  onInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Component for displaying dumping-specific form fields
 * 
 * @param {DumpingFormProps} props - Component props
 * @returns {JSX.Element} The rendered DumpingForm component
 */
const DumpingForm: React.FC<DumpingFormProps> = ({
  typeOfDumping,
  locationOfDumping,
  amountOfDumping,
  onInputChange
}) => {
  return (
    <>
      <h4>Illegal Dumping Details</h4>
      <label>Type of Illegal Dumping:</label>
      <select
        name="typeOfDumping"
        value={typeOfDumping}
        onChange={onInputChange}
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
        value={locationOfDumping}
        onChange={onInputChange}
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
        value={amountOfDumping}
        onChange={onInputChange}
        required
      >
        <option value="">Select Amount</option>
        <option value="Isolated (less than 10 items)">Isolated (less than 10 items)</option>
        <option value="Moderate (11-50 items)">Moderate (11-50 items)</option>
        <option value="Widespread (more than 50 items)">Widespread (more than 50 items)</option>
      </select>
    </>
  );
};

export default DumpingForm; 