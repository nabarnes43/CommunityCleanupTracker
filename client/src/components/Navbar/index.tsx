import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

/**
 * Navigation bar component that provides links to different sections of the application
 * 
 * @returns {JSX.Element} The rendered Navbar component
 */
const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-list-item"><Link to="/">Home</Link></li>
        <li className="navbar-list-item"><Link to="/users">User List</Link></li>
        <li className="navbar-list-item"><Link to="/users/create">Create User</Link></li>
        <li className="navbar-list-item"><Link to="/users/update">Update User</Link></li>
        <li className="navbar-list-item"><Link to="/users/delete">Delete User</Link></li>
        <li className="navbar-list-item"><Link to="/image-capture-demo">Image Capture</Link></li>
        <li className="navbar-list-item"><Link to="/about">About</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar; 