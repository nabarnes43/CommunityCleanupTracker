import React, { useRef, ChangeEvent } from 'react';
import './SimpleFileSelector.css';

/**
 * Props for the SimpleFileSelector component
 */
interface SimpleFileSelectorProps {
  /** File type to accept */
  accept: string;
  /** Label to display */
  label: string;
  /** Icon element to display */
  icon: React.ReactNode;
  /** Handler for file selection */
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Optional button class name */
  buttonClassName?: string;
}

/**
 * A simple file selector component that provides a button to select files
 * 
 * @param {SimpleFileSelectorProps} props - Component props
 * @returns {JSX.Element} The rendered SimpleFileSelector component
 */
const SimpleFileSelector: React.FC<SimpleFileSelectorProps> = ({
  accept,
  label,
  icon,
  onFileSelect,
  buttonClassName
}) => {
  // Reference to the file input element
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Trigger file input click when button is clicked
   */
  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="file-selector">
      <button 
        type="button" 
        className={`file-select-button ${buttonClassName || ''}`}
        onClick={handleButtonClick}
      >
        {icon}
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default SimpleFileSelector; 