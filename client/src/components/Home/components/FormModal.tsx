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
    <div className="modal w-100 h-100 flex items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-content bg-white p-lg rounded-md shadow-lg overflow-auto" style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
        {isSubmitting && (
          <div className="absolute w-100 h-100 flex flex-column items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.8)', top: 0, left: 0 }}>
            <div className="spinner"></div>
            <p className="text-md mt-md">Submitting...</p>
          </div>
        )}
        <button 
          onClick={onCancel} 
          className="modal-cancel-btn flex items-center justify-center bg-white text-bold"
          style={{ fontSize: '32px', border: 'none', cursor: 'pointer', color: '#333' }}
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