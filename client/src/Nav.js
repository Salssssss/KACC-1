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
  const userRole = localStorage.getItem('userRole');

  // Fetch active errors from the backend
  const fetchActiveErrors = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/errors/active-errors`);
      console.log('Active errors fetched:', response.data.errors); // Log API response
      setActiveErrors(response.data.errors || []); // Update state with active errors
    } catch (error) {
      console.error('Error fetching active errors:', error);
    }
  };
  
  
  const resolveError = async (activeErrorID) => {
    try {
      const resolutionNotes = prompt('Enter resolution notes:'); // Optional: ask for resolution notes
      if (!resolutionNotes) {
        alert('Resolution notes are required.');
        return;
      }
  
      // Optimistically update UI
      setActiveErrors((prevErrors) => prevErrors.filter((error) => error.active_error_id !== activeErrorID));
  
      // Call API to resolve the error
      const response = await axios.patch(`http://localhost:5000/errors/resolve-errors/${activeErrorID}`, {
        resolutionNotes,
      });
  
      console.log('Resolved error response:', response.data); // Debugging log
      alert('Error resolved successfully.');
  
      // Revalidate by fetching updated data
      fetchActiveErrors();
    } catch (error) {
      console.error('Error resolving error:', error);
      alert('Failed to resolve error. Please try again.');
    }
  };
  
  
  useEffect(() => {
    if (isLoggedIn) {
      fetchActiveErrors(); // Initial fetch

      // Set up polling to update errors every 30 seconds
      const interval = setInterval(() => {
        fetchActiveErrors();
      }, 30000);

      // Cleanup interval on component unmount
      return () => clearInterval(interval);
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
            <button onClick={() => navigate('/financial-dashboard')}>KPI</button>
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
    {activeErrors.length === 0 ? (
      // Render this if there are no active errors
      <p style={{ color: 'green', fontWeight: 'bold' }}>No active errors!</p>
    ) : (
      // Render this if there are active errors
      <>
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
                padding: '5px 0',
                textAlign: 'center',
                borderBottom: '1px solid #ccc',
                textDecoration: 'underline',
                color: 'blue',
              }}
            >
              Journal {error.journal_id}
              {/* Resolve Button for Managers */}
              {userRole === 'manager' && (
                <button
                  onClick={() => resolveError(error.active_error_id)}
                  style={{
                    marginLeft: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Resolve
                </button>
              )}
            </li>
          ))}
        </ul>
      </>
    )}
    {/* Tooltip */}
    {hoveredError && (
      <div
        style={{
          position: 'absolute',
          top: '30px',
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
