import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home/Home.js';
import About from './components/About';
import CreateUser from './components/CreateUser';
import UpdateUser from './components/UpdateUser';
import DeleteUser from './components/DeleteUser';
import UserList from './components/UserList';
import Navbar from './components/Navbar/Navbar.js'; 


function App() {
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
}

export default App;