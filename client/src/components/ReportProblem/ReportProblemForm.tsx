import React, { useState } from 'react';
import './ReportProblemForm.css';

/**
 * Props for the ReportProblemForm component
 */
interface ReportProblemFormProps {
  onSubmit: (feedback: { category: string, description: string }) => void;
  onCancel: () => void;
}

/**
 * Component for reporting app issues
 */
const ReportProblemForm: React.FC<ReportProblemFormProps> = ({ onSubmit, onCancel }) => {
  const [category, setCategory] = useState('App Bug');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ category, description });
  };

  return (
    <div className="report-problem-container">
      <h2>Report An Issue</h2>
      
      <form className="report-problem-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select 
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="App Bug">App Bug</option>
            <option value="Map Issue">Map Issue</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <textarea
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            rows={1}
            required
          ></textarea>
        </div>

        <div className="form-description-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue...."
            rows={10}
            required
          ></textarea>
        </div>

        <button type="submit" className="submit-button">
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default ReportProblemForm; 