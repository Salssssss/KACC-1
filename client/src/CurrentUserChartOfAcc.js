import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { generateCalendarHTML } from './calendar'; // Assuming you have a calendar.js file
import './calendar.css'; // Import the CSS file for the calendar

const UserChartOfAcc = () => {
  const [userAccounts, setUserAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // New state to store search query
  const [error, setError] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false); // State to toggle calendar visibility

  const userID = localStorage.getItem('user_id');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAccounts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/account/${userID}/accounts`, { withCredentials: true });
        setUserAccounts(response.data);
      } catch (error) {
        console.error('Error fetching user accounts: ', error);
        setError('Error fetching user accounts. Please try again.');
      }
    };

    fetchUserAccounts();
  }, [userID]);


  // Filter accounts based on search query
  const filteredAccounts = userAccounts.filter(account =>
    account.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.account_number.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleViewLedger = (accountId) => {
    navigate(`/ledger/${accountId}`);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Calendar Button */}
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <button onClick={() => setCalendarVisible(!calendarVisible)}>Toggle Calendar</button>
        {calendarVisible && (
          <div
            className="calendar-container"
            dangerouslySetInnerHTML={generateCalendarHTML()}
            style={{
              position: 'absolute',
              top: '50px',
              right: '10px',
              backgroundColor: 'white',
              border: '1px solid black',
              padding: '10px',
              zIndex: 1000
            }}
          />
        )}
      </div>

      <h2>Your Chart of Accounts</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Search input for filtering accounts */}
      <div>
        <input
          type="text"
          placeholder="Search by account name or number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '400px' }} // Adjust the width as needed
        />
      </div>

      {filteredAccounts.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Account Number</th>
              <th>Category</th>
              <th>Initial Balance</th>
              <th>Current Balance</th>
              <th>Actions</th>

            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account) => (
              <tr key={account.account_id}>
                <td>{account.account_name}</td>
                <td>{account.account_number}</td>
                <td>{account.category}</td>
                <td>{account.initial_balance}</td>
                <td>{account.balance}</td>
                <td>
                  <button onClick={() => handleViewLedger(account.account_id)}>View Ledger</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No accounts found for your search query.</p>
      )}
    </div>
  );
};

export default UserChartOfAcc;