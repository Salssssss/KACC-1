import React from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation

const LandingPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  return (
    <div>
      <h2>Welcome</h2>
      <p>Please select an option:</p>
      <button onClick={() => navigate('/login')}>Login</button>
      <button onClick={() => navigate('/create-account')}>Create Account</button>
    </div>
  );
};

export default LandingPage;
