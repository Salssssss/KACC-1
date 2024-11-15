import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { generateCalendarHTML } from './calendar'; 
import './calendar.css'; 

const UserChartOfAcc = () => {
  const [userAccounts, setUserAccounts] = useState([]);
  const [role, setRole] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); 
  const [error, setError] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false); 
  const userID = localStorage.getItem('user_id');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAccounts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/account/${userID}/accounts`, { withCredentials: true });
        setUserAccounts(response.data);
        setRole(localStorage.getItem('userRole'));
      } catch (error) {
        console.error('Error fetching user accounts: ', error);
        setError('Error fetching user accounts. Please try again.');
      }
    };

    fetchUserAccounts();
  }, [userID]);

  //Adding as a QOL thing 11/11/24 - Ian
  //Basically just highlight when a statement is going to be due soon
  const getDueDateMessage = (dueDate) => {
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    const daysRemaining = Math.floor((dueDateObj - today) / (1000 * 60 * 60 * 24));
    
    //More than two weeks out
    if (daysRemaining > 14) return { text: `${daysRemaining} days remaining`, color: 'green' };
    //Within two weeks of the statement being due
    if (daysRemaining >= 0) return { text: `${daysRemaining} days remaining`, color: 'yellow' };
    //Overdue
    return { text: `${Math.abs(daysRemaining)} days overdue`, color: 'red' };
  };

  // Filter accounts based on search query
  const filteredAccounts = userAccounts.filter(account =>
    account.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.account_number.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleViewLedger = (accountId) => {
    navigate(`/ledger/${accountId}`);
  };

  
  const handleViewLogs = (accountId) => {
    navigate(`/event-logs/${accountId}`);
  };

  const handleNavigation = (path) => navigate(path);

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
                  <button onClick={() => handleViewLogs(account.account_id)}>View Event logs</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No accounts found for your search query.</p>
      )}

      {/*Section with buttons to navigate to financial statement pages */}
      {/*THE ROLE NAME IS DATABASE IS LOWER CASED DON'T FORGET LIKE ME*/}
      {role === 'manager' && (
                <div>
                    <div>
                        {/* Trial Balance button - no due date */}
                        <button onClick={() => handleNavigation('/trial-balance')}>View Trial Balance</button>
                    </div>

                    {/* Monthly statements: Income Statement & Balance Sheet */}
                    <div>
                        <p style={{ color: getDueDateMessage(new Date().setDate(0)).color }}>
                            {getDueDateMessage(new Date().setDate(0)).text}
                        </p>
                        <button onClick={() => handleNavigation('/balance-sheet')}>View Balance Sheet</button>
                    </div>
                    <div>
                        <p style={{ color: getDueDateMessage(new Date().setDate(0)).color }}>
                            {getDueDateMessage(new Date().setDate(0)).text}
                        </p>
                        <button onClick={() => handleNavigation('/income-statement')}>View Income Statement</button>
                    </div>

                    {/* Yearly statement: Retained Earnings */}
                    <div>
                        <p style={{ color: getDueDateMessage(new Date(`${new Date().getFullYear()}-12-31`)).color }}>
                            {getDueDateMessage(new Date(`${new Date().getFullYear()}-12-31`)).text}
                        </p>
                        <button onClick={() => handleNavigation('/retained-earnings-statement')}>View Retained Earnings Statement</button>
                    </div>
                </div>
            )}
    </div>
  );
};

export default UserChartOfAcc;