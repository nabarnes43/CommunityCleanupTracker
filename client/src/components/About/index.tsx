import React from 'react';
import './styles.css'; // We'll create this CSS file later

/**
 * About page component that displays information about the application
 * and instructions for using the environmental reporting app
 * 
 * @returns {JSX.Element} The rendered About component
 */
const About: React.FC = () => {
  return (
    <div className="about-container">
      <h1>About Community Cleanup Tracker</h1>
      <p>This application helps communities track and manage cleanup efforts in their neighborhoods.</p>
      
      <div className="instructions-container">
        <h2>How to Use the Environmental Reporting App</h2>
        <p className="instructions-intro">
          Here are simple instructions for using the citizen science environmental reporting app:
        </p>
        
        <div className="instruction-section">
          <h3>Getting Started</h3>
          <ul>
            <li>Go to <a href="https://fawn-primary-neatly.ngrok-free.app/" target="_blank" rel="noopener noreferrer">https://fawn-primary-neatly.ngrok-free.app/</a></li>
            <li>
              <strong>Note:</strong> This is currently a development server as the app is still in demo form.
              The app will be permanently available online in the future.
            </li>
            <li>
              <strong>Enable location services</strong> in your browser when prompted. 
              This is required for accurate location reporting.
            </li>
          </ul>
        </div>
        
        <div className="instruction-section">
          <h3>Reporting an Environmental Issue</h3>
          <ol>
            <li>Click on the "Map" tab at the bottom of the screen</li>
            <li>Click on the location pin icon in the top right corner</li>
            <li>
              A popup will appear with reporting options for:
              <ul>
                <li>Illegal dumping on land/water</li>
                <li>Standing water locations</li>
                <li>Stormwater infrastructure problems</li>
              </ul>
            </li>
          </ol>
        </div>
        
        <div className="instruction-section">
          <h3>Completing Your Report</h3>
          <p>For each report type:</p>
          <ul>
            <li>Answer all drop down questions - these are required</li>
            <li>Upload a photo of the issue / Videos are accepted as well (mandatory for accuracy)</li>
            <li>Enter the date of your observation</li>
            <li>Add any notes or observations in the text field provided</li>
            <li>Indicate whether data was collected on-site or remotely</li>
            <li>Submit your report</li>
            <li>Your submitted pin will show in red first and then black</li>
          </ul>
        </div>
        
        <div className="instruction-section">
          <h3>Tips for Effective Reporting</h3>
          <ul>
            <li>Be as specific as possible when selecting categories</li>
            <li>Take clear photos that show the extent of the issue</li>
            <li>Include helpful details in your notes section</li>
            <li>Make sure your location services are enabled for accurate mapping</li>
          </ul>
        </div>
        
        <div className="conclusion">
          <p>
            This community science project helps track and address environmental issues in your area. 
            <strong> Your contributions make a difference!</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default About; 