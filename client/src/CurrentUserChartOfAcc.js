import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const UserChartOfAcc = () => {
  const [userAccounts, setUserAccounts] = useState([]);
  const [error, setError] = useState('');

  //Get the user ID from the URL
  const { userId } = useParams();
  
  //Fetch logged-in user information from localStorage
  const userID = localStorage.getItem('user_id');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchUserAccounts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/account/${userId}/accounts`, { withCredentials: true });
        setUserAccounts(response.data);
      } catch (error) {
        console.error('Error fetching user accounts: ', error);
      }
    };

    fetchUserAccounts();
  }, 
  //Fetch accounts when the component loads or userId changes
  [userId]);

  const handleEdit = (accountId) => {
    //Logic for editing an account (only accessible to admin users)
    console.log('Edit account:', accountId);
  };
  
  const handleDeactivate = (accountId) => {
    //Logic for deactivating an account (only accessible to admin users)
    console.log('Deactivate account:', accountId);
  };
  
  const handleAddAccount = () => {
    //Logic for adding a new account (only accessible to admin users)
    console.log('Add new account');
  };

  //Conditional rendering for buttons based on role
  const canEditOrAdd = userRole === 'administrator';  // Only admins can edit, add, or deactivate

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
              {/* Only show action buttons for admin users */}
              {canEditOrAdd && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {userAccounts.map((account) => (
              <tr key={account.account_id}>
                <td>{account.account_name}</td>
                <td>{account.account_number}</td>
                <td>{account.category}</td>
                <td>{account.initial_balance}</td>
                {/* Only show buttons for admin users */}
                {canEditOrAdd && (
                  <td>
                    <button onClick={() => handleEdit(account.account_id)}>Edit</button>
                    <button onClick={() => handleDeactivate(account.account_id)}>Deactivate</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No accounts found for your user profile.</p>
      )}

      {/* Only show add button for admin users */}
      {canEditOrAdd && (
        <button onClick={handleAddAccount}>Add New Account</button>
      )}
    </div>
  );
};



export default UserChartOfAcc;

