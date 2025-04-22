import React from 'react';
import ReportProblemForm from './ReportProblemForm';
import './ReportProblemModal.css';

/**
 * Props for the ReportProblemModal component
 */
interface ReportProblemModalProps {
  onSubmit: (feedback: { category: string, email: string, description: string }) => void;
  onClose: () => void;
}

/**
 * Modal component that contains the report problem form
 */
const ReportProblemModal: React.FC<ReportProblemModalProps> = ({ onSubmit, onClose }) => {
  return (
    <div className="report-problem-modal-overlay">
      <div className="report-problem-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <ReportProblemForm 
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default ReportProblemModal; 