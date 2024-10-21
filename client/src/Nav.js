import React from 'react';
import { useNavigate } from 'react-router-dom';

// Import images from the local directory
import logo from './images/Gray and Black Simple Studio Logo.png';

const Nav = () => {
  const navigate = useNavigate();

  // Check if user is logged in by checking localStorage
  const isLoggedIn = !!localStorage.getItem('user_id');

  // Get the user role from localStorage (if logged in)
  const userRole = localStorage.getItem('userRole'); 

  const user_id = localStorage.getItem('user_id');

  // Handler for navigating to the dashboard
  const handleDashboardNavigation = () => {
    if (userRole === 'administrator') {
      navigate('/admin-dashboard'); 
    } else {
      navigate('/user-dashboard'); 
    }
  };


  // Handler for logging out
  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('userRole');
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <nav>
      <div className="leftNav">
        <button onClick={() => navigate('/')}>
          <img src={logo} alt="Navigation Logo" style={{ width: '50px' }} /> {/* Replace this with the actual image */}
        </button>
      </div>
      <div className="rightNav">
        {!isLoggedIn && (
          <>
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/create-profile')}>Create Profile</button>
          </>
        )}
        {isLoggedIn && (
          <>
            <button onClick={() => navigate('/user-accounts')}>Chart Of Accounts</button>
            <button onClick={handleDashboardNavigation}>Dashboard</button>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={() => navigate(`/Journal/${user_id}`)}>Journal</button>
          </>
        )}
        <button onClick={() => navigate('/About')}>About</button>
      </div>
    </nav>
  );

};

export default Nav;
