import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { generateCalendarHTML } from './calendar'; // Assuming you have a calendar.js file
import './calendar.css'; // Import the CSS file for the calendar

const AdminChartOfAcc = () => {
  const { userId } = useParams();
  const [userAccounts, setUserAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null); // State to store selected account for editing
  const [editData, setEditData] = useState({}); // State to store form data for editing
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [calendarVisible, setCalendarVisible] = useState(false); // State to toggle calendar visibility
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

  const handleEditClick = async (accountId) => {
    try {
      const response = await axios.get(`http://localhost:5000/account/${accountId}`, { withCredentials: true });
      setSelectedAccount(accountId);
      setEditData(response.data); // Set initial form data to current values of the account
    } catch (error) {
      console.error('Error fetching account details:', error);
      setError('Error fetching account details. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`http://localhost:5000/account/edit/${selectedAccount}`, editData, { withCredentials: true });
      alert('Account updated successfully');
      // Re-fetch accounts to reflect changes
      const response = await axios.get(`http://localhost:5000/account/${userId}/accounts`, { withCredentials: true });
      setUserAccounts(response.data);
      setSelectedAccount(null); // Close the edit form after successful update
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
    navigate(`/create-account/${userId}`); // Navigate to the create account page
  };

  const handleViewLedger = (accountId) => {
    navigate(`/ledger/${accountId}`);  // Navigate to GeneralLedger.js page with account_id as param
  };

  // Filter accounts based on the search query
  const filteredAccounts = userAccounts.filter(account =>
    account.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.account_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <h1>Chart of Accounts for User {userId}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Search input for filtering accounts */}
      <div>
        <input
          type="text"
          placeholder="Search by account name or number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '400px' }} // Makes the search bar wider
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
              {canEditOrAdd && <th>Actions</th>}
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
                  {canEditOrAdd && (
                    <>
                      <button onClick={() => handleEditClick(account.account_id)}>Edit</button>
                      <button onClick={() => handleDeactivate(account.account_id)}>Deactivate</button>
                    </>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No accounts found for this user.</p>
      )}

      {canEditOrAdd && (
        <button onClick={handleAddAccount}>Add New Account</button>
      )}

      {selectedAccount && (
        <div className="edit-form">
          <h3>Edit Account</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }}>
            <div>
              <label>Account Name:</label>
              <input
                type="text"
                name="account_name"
                value={editData.account_name || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Account Number:</label>
              <input
                type="text"
                name="account_number"
                value={editData.account_number || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Account Description:</label>
              <input
                type="text"
                name="account_description"
                value={editData.account_description || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Normal Side:</label>
              <select name="normal_side" value={editData.normal_side || ''} onChange={handleInputChange}>
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>
            </div>
            <div>
              <label>Category:</label>
              <input
                type="text"
                name="category"
                value={editData.category || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Subcategory:</label>
              <input
                type="text"
                name="subcategory"
                value={editData.subcategory || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Initial Balance:</label>
              <input
                type="number"
                name="initial_balance"
                value={editData.initial_balance || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Order:</label>
              <input
                type="number"
                name="order"
                value={editData.order || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Statement:</label>
              <select name="statement" value={editData.statement || ''} onChange={handleInputChange}>
                <option value="BS">Balance Sheet</option>
                <option value="IS">Income Statement</option>
                <option value="RE">Retained Earnings</option>
              </select>
            </div>
            <div>
              <label>Current Balance:</label>
              <input
                type="number"
                name="balance"
                value={editData.balance || ''}
                readOnly
              />
            </div>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setSelectedAccount(null)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminChartOfAcc;
