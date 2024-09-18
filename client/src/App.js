import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage'; 
import Login from './Login'; 
import CreateAccount from './CreateAccount'; 
import Dashboard from './Dashboard'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Define the routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
