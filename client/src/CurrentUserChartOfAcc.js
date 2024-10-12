import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserChartOfAcc = () => {
  const [userAccounts, setUserAccounts] = useState([]);
  const [error, setError] = useState('');
  
  //Fetch logged-in user information from localStorage
  const userID = localStorage.getItem('user_id');
  const userRole = localStorage.getItem('userRole');
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

  const handleViewLedger = (accountId) => {
    navigate(`/account/${accountId}/ledger`);
  };

  return (
    <div>
      <h2>Your Chart of Accounts</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {userAccounts.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Account Number</th>
              <th>Category</th>
              <th>Initial Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userAccounts.map((account) => (
              <tr key={account.account_id}>
                <td>{account.account_name}</td>
                <td>{account.account_number}</td>
                <td>{account.category}</td>
                <td>{account.initial_balance}</td>
                <td>
                  <button onClick={() => handleViewLedger(account.account_id)}>View Ledger</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No accounts found for your user profile.</p>
      )}
    </div>
  );
};

export default UserChartOfAcc;
