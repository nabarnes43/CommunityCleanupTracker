// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Import CSS

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-list-item"><Link to="/">Home</Link></li>
        <li className="navbar-list-item"><Link to="/users">User List</Link></li>
        <li className="navbar-list-item"><Link to="/users/create">Create User</Link></li>
        <li className="navbar-list-item"><Link to="/users/update">Update User</Link></li>
        <li className="navbar-list-item"><Link to="/users/delete">Delete User</Link></li>
        <li className="navbar-list-item"><Link to="/about">About</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;