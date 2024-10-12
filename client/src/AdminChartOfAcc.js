import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminChartOfAcc = () => {
  //Get the user ID from the URL
  //Using this instead of localstorage because the userid needs to be dynamic for this page
  //userId -> admin viewing another user's account
  //userID -> current user viewing their account 
  //Not the best naming, I was locked in and just wanted to test it. Might change later. 
  const { userId } = useParams();
  const [userAccounts, setUserAccounts] = useState([]);
  const navigate = useNavigate();

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

  const handleViewLedger = (accountId) => {
    navigate(`/ledger/${accountId}`);  // Navigate to GeneralLedger.js page with account_id as param
  };


  return (
    <div>
      <h1>Chart of Accounts for User {userId}</h1>
      {userAccounts.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Account Number</th>
              <th>Category</th>
              <th>Initial Balance</th>
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
        <p>No accounts found for this user.</p>
      )}
    </div>
  );
};

export default AdminChartOfAcc;
