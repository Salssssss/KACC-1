import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from './images/Gray and Black Simple Studio Logo.png';

const Nav = () => {
  const navigate = useNavigate();

  // State for active errors
  const [activeErrors, setActiveErrors] = useState([]);
  const [hoveredError, setHoveredError] = useState(null);

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('user_id');

  // Get user ID
  const user_id = localStorage.getItem('user_id');

  // Fetch active errors from the backend
  const fetchActiveErrors = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/errors/active-errors/${user_id}`);
      console.log('errors', response.data.errors);
      setActiveErrors(response.data.errors || []); // Assuming the API returns { count, errors }
    } catch (error) {
      console.error('Error fetching active errors:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchActiveErrors();
    }
  }, [isLoggedIn]);

  return (
    <nav class="navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
      {/* Left Section: Logo and Navigation Buttons */}
      <div className="leftNav" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => navigate('/')}>
          <img src={logo} alt="Navigation Logo" style={{ width: '50px' }} />
        </button>
        {isLoggedIn && (
          <>
            <button onClick={() => navigate('/user-accounts')}>Chart Of Accounts</button>
            <button onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button onClick={() => navigate(`/Journal/${user_id}`)}>Journal</button>
            <button
              onClick={() => {
                localStorage.clear();
                navigate('/');
              }}
            >
              Logout
            </button>
          </>
        )}
        {!isLoggedIn && (
          <>
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/create-profile')}>Create Profile</button>
          </>
        )}
        <button onClick={() => navigate('/About')}>About</button>
      </div>

      {/* Center Section: Active Errors */}
      {isLoggedIn && (
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <span style={{ color: 'red', fontWeight: 'bold' }}>
            Active Errors: {activeErrors.length}
          </span>
          {/* Hoverable List */}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {activeErrors.map((error) => (
              <li
                key={error.active_error_id}
                onMouseEnter={() => setHoveredError(error)}
                onMouseLeave={() => setHoveredError(null)}
                style={{
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '5px 0',
                  borderBottom: '1px solid #ccc',
                }}
              >
                <span style={{ textDecoration: 'underline', color: 'blue' }}>
                  Journal {error.journal_id}
                </span>
              </li>
            ))}
          </ul>
          {/* Hover Box */}
          {hoveredError && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'white',
                border: '1px solid gray',
                padding: '10px',
                borderRadius: '5px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
              }}
            >
              <p><strong>Journal ID:</strong> {hoveredError.journal_id}</p>
              <p><strong>Error:</strong> {hoveredError.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Right Section: Empty (Optional for future use) */}
      <div className="rightNav" />
    </nav>
  );
};

export default Nav;
