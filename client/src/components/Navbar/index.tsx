import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
// Import images
import About from '../../img/About.png';
import Map from '../../img/Map.png';
import PinsList from '../../img/PinsList.png';


/**
 * Navigation bar component that provides links to different sections of the application
 * Positioned at the bottom of the screen with responsive design for both mobile and desktop
 * 
 * @returns {JSX.Element} The rendered Navbar component
 */
const Navbar: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if the device is mobile based on screen width
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIsMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return (
    <nav className={`navbar ${isMobile ? 'mobile' : 'desktop'}`}>
      <ul className="navbar-list">
        <li className="navbar-list-item">
          <Link to="/list">
            <img src={PinsList} alt="Pins List" />
          </Link>
        </li>
        <li className="navbar-list-item">
          <Link to="/">
            <img src={Map} alt="Map" />
          </Link>
        </li>
        <li className="navbar-list-item">
          <Link to="/about">
            <img src={About} alt="About" />
          </Link>
        </li>
        {/* 
          Commented out tabs for future use
          <li className="navbar-list-item"><Link to="/users">User List</Link></li>
          <li className="navbar-list-item"><Link to="/users/create">Create User</Link></li>
          <li className="navbar-list-item"><Link to="/users/update">Update User</Link></li>
          <li className="navbar-list-item"><Link to="/users/delete">Delete User</Link></li>
          <li className="navbar-list-item"><Link to="/image-capture-demo">Image Capture</Link></li>
        */}
      </ul>
    </nav>
  );
};

export default Navbar; 