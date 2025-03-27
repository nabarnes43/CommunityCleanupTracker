import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
// import { UserList, CreateUser, UpdateUser, DeleteUser } from './components/User';
import Navbar from './components/Navbar';
// import CameraComponent from './components/ImageCapture/TestCamera';
// import ImageCaptureDemo from './components/ImageCapture/ImageCaptureDemo';

/**
 * Main application component that sets up routing for the application
 * 
 * @returns {JSX.Element} The rendered App component
 */
const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            {/* Commented out routes for future use
            <Route path="/users" element={<UserList />} />
            <Route path="/users/create" element={<CreateUser />} />
            <Route path="/users/update" element={<UpdateUser />} />
            <Route path="/users/delete" element={<DeleteUser />} />
            <Route path="/test-camera" element={<CameraComponent />} />
            <Route path="/image-capture-demo" element={<ImageCaptureDemo />} />
            */}
          </Routes>
        </main>
        <Navbar />
      </div>
    </Router>
  );
};

export default App; 