
import Nav from './Nav';

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './Login';
import CreateAccount from './CreateAccount';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import SetPassword from './SetPassword'; // Import the SetPassword component
import TopRightProfile from './TopRightProfile';

// ProtectedRoute component to restrict access to certain routes
const ProtectedRoute = ({ children, allowedRole }) => {
  const userRole = localStorage.getItem('userRole'); // Get user role from localStorage or another state

  if (!userRole) {
    // If no role is found, redirect to login
    return <Navigate to="/login" />;
  }

  // Check if the user has the required role
  if (userRole !== allowedRole) {
    return <Navigate to="/dashboard" />; // Redirect to dashboard for non-admin users
  }

  return children; // Render the protected component if role matches
};


function App() {
  const [userRole, setUserRole] = useState(null);

  // Check user role from localStorage on app load
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  return (
    <Router>
      <Nav />
      {/* Render the UserProfile component to display username and profile picture */}
      <TopRightProfile />
      <Routes>
        {/* Define the routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />

        {/* Add SetPassword route for password setup */}
        <Route path="/set-password" element={<SetPassword />} />

        {/* Protected Admin Route */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="administrator">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Dashboard route, accessible to all users */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
