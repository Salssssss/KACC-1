import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
  //Get the user ID from the URL
  //Using this instead of localstorage because the userid needs to be dynamic for this page
  //userId -> admin viewing another user's account
  //userID -> current user viewing their account 
  //Not the best naming, I was locked in and just wanted to test it. Might change later.
const AdminChartOfAcc = () => {
  const { userId } = useParams();
  const [userAccounts, setUserAccounts] = useState([]);
  const [error, setError] = useState(null);
  const canEditOrAdd = true; // Set based on user role (example: admin can edit/add)
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUserAccounts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/account/${userId}/accounts`, { withCredentials: true });
        setUserAccounts(response.data);
      } catch (error) {
        console.error('Error fetching user accounts: ', error);
        setError('Error fetching user accounts.');
      }
    };

    if (userId) {
      fetchUserAccounts();
    }
  }, [userId]);

  const handleEdit = async (accountId) => {
    // Add logic to get new account data (e.g., open a modal to input new values)
    const updatedData = {
      account_name: 'Updated Account Name',
      initial_balance: 0
    };
    try {
      await axios.put(`http://localhost:5000/account/edit/${accountId}`, updatedData, { withCredentials: true });
      alert('Account updated successfully');
      // Re-fetch accounts to reflect changes
      const response = await axios.get(`http://localhost:5000/account/${userId}/accounts`, { withCredentials: true });
      setUserAccounts(response.data);
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Error updating account');
    }
  };

  const handleDeactivate = async (accountId) => {
    try {
      await axios.put(`http://localhost:5000/account/deactivate/${accountId}`, {}, { withCredentials: true });
      alert('Account deactivated successfully');
      // Re-fetch accounts to reflect changes
      const response = await axios.get(`http://localhost:5000/account/${userId}/accounts`, { withCredentials: true });
      setUserAccounts(response.data);
    } catch (error) {
      console.error('Error deactivating account:', error);
      alert('Error deactivating account');
    }
  };

  const handleAddAccount = () => {
    navigate('/accounts/create'); // Navigate to the create account page
  };

  return (
    <div>
      <h1>Chart of Accounts for User {userId}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {userAccounts.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Account Number</th>
              <th>Category</th>
              <th>Initial Balance</th>
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

      {canEditOrAdd && (
        <button onClick={handleAddAccount}>Add New Account</button>
      )}
    </div>
  );
};

export default AdminChartOfAcc;
