import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import { UserList, CreateUser, UpdateUser, DeleteUser } from './components/User';
import Navbar from './components/Navbar';

/**
 * Main application component that sets up routing for the application
 * 
 * @returns {JSX.Element} The rendered App component
 */
const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <main>
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/users/create" element={<CreateUser />} />
            <Route path="/users/update" element={<UpdateUser />} />
            <Route path="/users/delete" element={<DeleteUser />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
};

export default App; 