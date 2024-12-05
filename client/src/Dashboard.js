import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './css scripts/Dashboard.css';

const Dashboard = () => {
  const [userRole, setUserRole] = useState('user'); // Default role
  const [pendingCount, setPendingCount] = useState(0);
  const UserId = localStorage.getItem('user_id');

  useEffect(() => {
    // Fetch user role from local storage or session
    const storedUserRole = localStorage.getItem('userRole');
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }

    // Fetch pending journal count if user is a manager
    const fetchPendingCount = async () => {
      if (true) {
        try {
          const response = await axios.get('http://localhost:5000/journal/pending/count');
          setPendingCount(response.data.pendingCount);
        } catch (error) {
          console.error('Error fetching pending journal count:', error);
        }
      }
    };

    fetchPendingCount();
  }, []);

  return (
    <div className='dash'>
      <h2 id='welcome'>Welcome to the Dashboard!</h2>
      
      <div className='dashboard-links'>
        <ul>
          <li>
            <Link to='/user-accounts'>Chart of Accounts</Link>
          </li>
          <li>
          <Link to={`/journal/${UserId}`}>
              Journal Entries
              {/* Display alert if user is manager and there are pending journals */}
              {userRole === 'manager' && pendingCount > 0 && (
                <span className='alert-badge'>({pendingCount} Pending)</span>
              )}
            </Link>
          </li>
          <li>
            <Link to='/team'>Team Page</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
