import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

/**
 * SVG component for the map icon 
 * TODO make this its own navbar icon component in another filw ith the others
 * Inlined from mapTab.svg for direct usage in the component
 * 
 * @returns {JSX.Element} The rendered SVG icon
 */
const MapTabIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="map-tab-icon">
    <g filter="url(#filter0_d_55_119)">
      <path d="M16 34L2 42V10L16 2M16 34L32 42M16 34V2M32 42L46 34V2L32 10M32 42V10M32 10L16 2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" shape-rendering="crispEdges"/>
    </g>
    <defs>
      <filter id="filter0_d_55_119" x="-3.25" y="0.75" width="54.5" height="50.5" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_55_119"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_55_119" result="shape"/>
      </filter>
    </defs>
  </svg>
);

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
          <Link to="/">
            <div className="nav-icon">
              <MapTabIcon />
            </div>
            <span className="nav-label">Map</span>
          </Link>
        </li>
        <li className="navbar-list-item">
          <Link to="/about">
            <div className="nav-icon">&#9432;</div>
            <span className="nav-label">About</span>
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