import React from 'react';
import './styles.css'; // We'll create this CSS file later

// Import the necessary images
import MapIcon from '../../img/Map.png';
import PinsListIcon from '../../img/PinsList.png';
import AboutIcon from '../../img/About.png';
import MarkerIcon from '../../img/marker.png';
import ReportProblemIcon from '../../img/ReportProblem.png';
import NavigationIcon from '../../img/NavigationBackground.png';

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
      <p>This application helps communities track and manage cleanup efforts in their neighborhoods. It's designed to be simple and easy to use for people of all ages.</p>
      
      <div className="instructions-container">
        <h2>How to Use the Community Cleanup Tracker</h2>
        <p className="instructions-intro">
          Below are simple, step-by-step instructions to help you use this app. Each section is organized to make it easy to follow along.
        </p>
        
        <div className="instruction-section">
          <h3>Step 1: Getting Started</h3>
          <ul>
            <li>Open your web browser (like Safari, Chrome, or Firefox)</li>
            <li>Type or click this address: <a href="https://api-test-427120.web.app" target="_blank" rel="noopener noreferrer">api-test-427120.web.app</a></li>
            <li>
              <strong>Important:</strong> When asked if the app can use your location, please tap "Allow" or "Yes". This helps the app show your current position on the map.
            </li>
            <li>
              <strong>Note:</strong> This is currently a development version. In the future, the app will have a permanent address.
            </li>
          </ul>
        </div>
        
        <div className="instruction-section">
          <h3>Step 2: Using the Map</h3>
          <p>At the bottom of your screen, you'll see a navigation bar with these icons:</p>
          
          <div className="icon-example">
            <div className="icon-item">
              <img src={PinsListIcon} alt="Pins List Icon" />
              <div className="icon-label">My Reports</div>
            </div>
            <div className="icon-item">
              <img src={MapIcon} alt="Map Icon" />
              <div className="icon-label">Map</div>
            </div>
            <div className="icon-item">
              <img src={AboutIcon} alt="About Icon" />
              <div className="icon-label">About</div>
            </div>
          </div>
          
          <ol>
            <li>Tap on the <strong>Map</strong> icon shown above to view the community map.</li>
            <li>You will see markers showing reported environmental issues in your area.</li>
            <li>You can zoom in and out using the + and - buttons, or by pinching the screen (on mobile devices).</li>
            <li>Tap on any marker to see details about that environmental issue.</li>
          </ol>
          
          <div className="example-image">
            <img src={MarkerIcon} alt="Example of map markers" />
          </div>
          <p><em>Example: What the map markers look like on the map</em></p>
        </div>
        
        <div className="instruction-section">
          <h3>Step 3: Reporting an Environmental Issue</h3>
          <p>While viewing the map, you'll see these control buttons in the top-right corner:</p>
          
          <div className="icon-example">
            <div className="icon-item">
              <img src={MarkerIcon} alt="Pin Icon" />
              <div className="icon-label">Report Issue</div>
            </div>
            <div className="icon-item">
              <img src={NavigationIcon} alt="Location Icon" />
              <div className="icon-label">My Location</div>
            </div>
            <div className="icon-item">
              <img src={ReportProblemIcon} alt="Report Problem Icon" />
              <div className="icon-label">App Help</div>
            </div>
          </div>
          
          <div className="step-description">
            <p><span className="step-highlight">1</span><strong>Start a report:</strong> Tap on the <strong>Report Issue</strong> pin icon shown above.</p>
            
            <p><span className="step-highlight">2</span><strong>Select issue type:</strong> Choose from one of these options:</p>
            <ul>
              <li><strong>Illegal dumping</strong> on land or in water</li>
              <li><strong>Standing water</strong> locations that could be breeding grounds for mosquitoes</li>
              <li><strong>Stormwater problems</strong> like clogged drains or flooding</li>
            </ul>
            
            <p><span className="step-highlight">3</span><strong>Add details:</strong> For each type, answer specific questions:</p>
            <ul>
              <li>For <strong>illegal dumping</strong>, describe the size, materials, and impact</li>
              <li>For <strong>standing water</strong>, note the source, size, and location details</li>
              <li>For <strong>stormwater issues</strong>, specify the problem type and severity</li>
            </ul>
            
            <p><span className="step-highlight">4</span><strong>Take a photo:</strong> Tap the camera area to take a new photo or select one from your device.</p>
            
            <p><span className="step-highlight">5</span><strong>Add date & notes:</strong> Select when you saw the issue and add any helpful information.</p>
            
            <p><span className="step-highlight">6</span><strong>Submit:</strong> Tap the <strong>"Submit"</strong> button at the bottom. Your report will appear on the map.</p>
          </div>
        </div>
        
        <div className="instruction-section">
          <h3>Step 4: Viewing Your Reports</h3>
          <div className="step-description">
            <p><span className="step-highlight">1</span>To see all your submitted reports, tap the <strong>"My Reports"</strong> icon at the bottom of the screen (the first icon in the navigation bar).</p>
            <p><span className="step-highlight">2</span>Tap on any report to view its full details.</p>
            <p><span className="step-highlight">3</span>Your reports help community leaders identify problem areas that need attention.</p>
          </div>
        </div>

        <div className="instruction-section">
          <h3>Step 5: Getting Help with the App</h3>
          <p>If you encounter any problems using the application itself, you can report these issues too:</p>
          
          <div className="step-description">
            <p><span className="step-highlight">1</span><strong>Find the Help button:</strong> On the map screen, tap the <strong>App Help</strong> icon (shown below) in the top-right corner.</p>
            
            <div className="example-image">
              <img src={ReportProblemIcon} alt="Report Problem Icon" style={{maxWidth: '50px'}} />
            </div>
            
            <p><span className="step-highlight">2</span><strong>Describe the problem:</strong> In the form that appears, explain what issues you're having with the app itself.</p>
            
            <p><span className="step-highlight">3</span><strong>Be specific:</strong> Include details such as:</p>
            <ul>
              <li>What you were trying to do when the problem occurred</li>
              <li>What device and browser you are using</li>
              <li>Any error messages you saw</li>
              <li>Screenshots of the problem (if possible)</li>
            </ul>
            
            <p><span className="step-highlight">4</span><strong>Submit feedback:</strong> This information helps the developers improve the application for everyone.</p>
            
            <p><em>Note: The "App Help" feature is for technical problems with the application itself, not for reporting environmental issues.</em></p>
          </div>
        </div>

        <div className="instruction-section">
          <h3>Tips</h3>
          <ul>
            <li>If text is too small, use your device's text size settings to make it larger.</li>
            <li>Take your time when filling out reports - there's no rush.</li>
            <li>If you make a mistake, you can cancel and start over.</li>
            <li>Ask a family member or friend for help if you need assistance.</li>
            <li>For the clearest photos, make sure you have good lighting.</li>
            <li>If your hand is unsteady, try resting your arm on a stable surface when taking photos.</li>
            <li>If you're having trouble with the map, try the "My Location" button (compass icon) to center the map on where you are.</li>
          </ul>
        </div>
        
        <div className="conclusion">
          <p>
            Thank you for participating in this community project. Your reports help identify environmental issues in your neighborhood and lead to cleaner, healthier communities.
            <br/><br/>
            <strong>Every report makes a difference!</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default About; 