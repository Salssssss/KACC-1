import React from 'react';
import { useNavigate } from 'react-router-dom';

// Import images from the local directory
import logo from './images/Gray and Black Simple Studio Logo.png';

const Nav = () => {
  const navigate = useNavigate();

  //Check if user is logged in by checking localStorage
  const isLoggedIn = !!localStorage.getItem('user_id');

  // Get the user role from localStorage (if logged in)
  const userRole = localStorage.getItem('userRole'); 

  //Handler for navigating to the dashboard
  const handleDashboardNavigation = () => {
    if (userRole === 'administrator') {
      navigate('/admin-dashboard'); 
    } 
    else {
      navigate('/user-dashboard'); 
    }
  };

    return (
        <nav>
            <div className="leftNav">
                <button onClick={() => navigate('/')}>
                    <img src={logo} alt="Navigation Logo" style={{ width: '50px' }} /> {/* Replace this with the actual image */}
                </button>
            </div>
            <div className="rightNav">
                <button onClick={() => navigate('/login')}>Login</button>

                <button onClick={() => navigate('/create-profile')}>Create Account</button>

                {isLoggedIn && <button onClick={() => navigate('/user-accounts')}>Chart Of Accounts</button>}
                {isLoggedIn && (<button onClick={handleDashboardNavigation}>Dashboard</button>)}

            </div>
        </nav>
    );
};

export default Nav;