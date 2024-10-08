import Nav from './Nav';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './Login';
import CreateProfile from './CreateProfile';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import SetPassword from './SetPassword';
import SelectSecurityQuestions from './SelectSecurityQuestions';
import ForgotPassword from './ForgotPassword';
import TopRightProfile from './TopRightProfile';


const ProtectedRoute = ({ children, allowedRole }) => {
  const userRole = localStorage.getItem('userRole');

  if (!userRole) {
    return <Navigate to="/login" />;
  }

  if (userRole !== allowedRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};


function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    const loggedInStatus = localStorage.getItem('isLoggedIn');
  
  
  }, []);

  return (
    <Router>
      <Nav />
      {/* Conditionally render the profile only if the user is logged in */}
      {isLoggedIn && <TopRightProfile />}  {/* This will only render after login */}
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Login Route */}
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

        {/* Forgot Passowrd route*/}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Create Profile Route */}
        <Route path="/create-profile" element={<CreateProfile />} />
        
        {/* Password Setup */}
        <Route path="/set-password" element={<SetPassword />} />

        {/* Security Questions Setup Route */}
        <Route
          path="/select-security-questions"
          element={<SelectSecurityQuestions /> }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="administrator">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
