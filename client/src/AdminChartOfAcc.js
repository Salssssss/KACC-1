import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const AdminChartOfAcc = () => {
  //Get the user ID from the URL
  const { userId } = useParams();
  const [userAccounts, setUserAccounts] = useState([]);

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
