import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateAccount = () => {
  const navigate = useNavigate();

  // Initialize state with account data, 
  const [accountData, setAccountData] = useState({
    account_name: '',
    account_number: '',
    account_description: '',
    normal_side: 'debit',
    category: '',
    subcategory: '',
    initial_balance: 0,
    order: '',
    statement: 'BS',
    team_id: ''  // New field for team_id
  });

  const [error, setError] = useState(null);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccountData({
      ...accountData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Post the form data to the backend,
      await axios.post('http://localhost:5000/account/create', accountData, { withCredentials: true });
      alert('Account created successfully');
      navigate(`/chart-of-accounts/${accountData.team_id}`); // Redirect to team-specific chart of accounts
    } catch (error) {
      console.error('Error creating account:', error);
      setError('Error creating account. Please try again.');
    }
  };

  return (
    <div>
      <h1>Create New Account</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Account Name:</label>
          <input type="text" name="account_name" value={accountData.account_name} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Account Number:</label>
          <input type="text" name="account_number" value={accountData.account_number} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Account Description:</label>
          <input type="text" name="account_description" value={accountData.account_description} onChange={handleInputChange} />
        </div>
        <div>
          <label>Normal Side:</label>
          <select name="normal_side" value={accountData.normal_side} onChange={handleInputChange}>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
        </div>
        <div>
          <label>Category:</label>
          <input type="text" name="category" value={accountData.category} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Subcategory:</label>
          <input type="text" name="subcategory" value={accountData.subcategory} onChange={handleInputChange} />
        </div>
        <div>
          <label>Initial Balance:</label>
          <input type="number" name="initial_balance" value={accountData.initial_balance} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Order:</label>
          <input type="number" name="order" value={accountData.order} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Statement:</label>
          <select name="statement" value={accountData.statement} onChange={handleInputChange}>
            <option value="BS">Balance Sheet</option>
            <option value="IS">Income Statement</option>
            <option value="RE">Retained Earnings</option>
          </select>
        </div>
        <div>
          <label>Team ID:</label>
          <input type="text" name="team_id" value={accountData.team_id} onChange={handleInputChange} required />
        </div>
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default CreateAccount;
