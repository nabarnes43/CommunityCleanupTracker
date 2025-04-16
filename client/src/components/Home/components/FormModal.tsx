import React from 'react';
import PinDataForm from '../../PinDataForm';

/**
 * Props for the FormModal component
 */
interface FormModalProps {
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

/**
 * Component that displays the form in a modal
 * 
 * @param {FormModalProps} props Component properties
 * @returns {JSX.Element} The rendered FormModal component
 */
const FormModal: React.FC<FormModalProps> = ({
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <button 
          onClick={onCancel} 
          className="modal-cancel-btn"
        >
          ×
        </button>
        <PinDataForm 
          onSubmit={onSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default FormModal; 