import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className='dash'>
      {/* Need username here */}
      <h2 id='welcome'>Welcome to the Dashboard!</h2>
      
      <div className='dashboard-links'>
        <ul>
          <li>
            <Link to='/user-accounts'>Chart of Accounts</Link>
          </li>
          <li>
            <Link to='/journal/:user_id'>Journal Entries</Link>
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
