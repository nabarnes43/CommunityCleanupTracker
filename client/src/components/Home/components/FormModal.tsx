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
        {isSubmitting && (
          <div className="absolute w-100 h-100 flex flex-column items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.8)', top: 0, left: 0, zIndex: 10 }}>
            <div className="spinner"></div>
            <p className="text-md mt-md">Submitting...</p>
          </div>
        )}
        <button 
          onClick={onCancel} 
          className="modal-cancel-btn"
        >
          ×
        </button>
        <PinDataForm 
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
};

export default FormModal; 