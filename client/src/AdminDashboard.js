import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'administrator') {
      alert('Unauthorized access');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUsersByRole = async () => {
      try {
        const response = await axios.get('http://localhost:5000/admin/users-by-role', { withCredentials: true });
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching the users: ', error);
        setError(error.message);
      }
    };
    fetchUsersByRole();
  }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'pending' ? 'active' : 'inactive'; // Activate the account if pending

    try {
      await axios.put(
        `http://localhost:5000/admin/activate-or-deactivate-user/${user.user_id}`,
        { status: newStatus },
        { withCredentials: true }
      );

      alert(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);

      if (newStatus === 'active') {
        await axios.post(
          'http://localhost:5000/admin/send-activation-email',
          { userId: user.user_id, email: user.email },
          { withCredentials: true }
        );
        alert('Activation email sent to user');
      }

      // Update the user list after activation
      const updatedUsers = users.map(u => 
        u.user_id === user.user_id ? { ...u, status: newStatus } : u
      );
      setUsers(updatedUsers);
      
    } catch (err) {
      console.error('Error updating user status: ', err);
      alert('Error updating user status');
    }
  };

  // State for suspension start and end dates
  const [suspensionStart, setSuspensionStart] = useState(null);
  const [suspensionEnd, setSuspensionEnd] = useState(null);

  const handleSuspendUser = async (user) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/suspend-user/${user.user_id}`,
        { suspensionStart, suspensionEnd },
        { withCredentials: true }
      );

      alert('User suspended successfully');

      const response = await axios.get('http://localhost:5000/admin/users-by-role', { withCredentials: true });
      setUsers(response.data.users);
    } catch (err) {
      console.error('Error suspending user: ', err);
      alert('Error suspending user');
    }
  };

  return (
    <div className='adminDash'>
      <h2>Welcome to the Admin Dashboard!</h2>
      {error && <p>Error: {error}</p>}

      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role_name}</td>
              <td>{user.status}</td>
              <td>
                {/* Show toggle only if status is pending */}
                {user.status === 'pending' && (
                  <div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={user.status === 'active'}
                        onChange={() => handleToggleStatus(user)}
                      />
                      <span className="slider round"></span>
                    </label>
                    <span style={{ marginLeft: '10px' }}>Activate Account</span>
                  </div>
                )}
              </td>
              <td>
                {/* Suspension functionality */}
                <h4>Suspend User</h4>
                <DatePicker
                  className='datePicker'
                  selected={suspensionStart}
                  onChange={(date) => setSuspensionStart(date)}
                  placeholderText="Select suspension start date"
                />
                <DatePicker
                  className='datePicker'
                  selected={suspensionEnd}
                  onChange={(date) => setSuspensionEnd(date)}
                  placeholderText="Select suspension end date"
                />
                <button onClick={() => handleSuspendUser(user)}>Suspend User</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
