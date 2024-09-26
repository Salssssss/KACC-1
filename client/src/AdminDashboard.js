import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  //store the users from the backend
  const [users, setUsers] = useState([]);
  //Store the ID of the user that gets edited
  const [editUserID, setEditUserID] = useState(null);
  //Hold onto any errors that come up
  const [error, setError] = useState(null);
  //Store the form data for the user being edited
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
  });

  const navigate = useNavigate();
  //useEffect to verify the user's role once again
  console.log(localStorage.getItem('userRole'))
  useEffect(() => {
    const userRole = localStorage.getItem('userRole'); 

    if (userRole !== 'administrator') {
      alert('Unauthorized access');
      navigate('/login'); 
    }
  }, [navigate]);
  

  //useEffect to display data
  useEffect(() => {
    const fetchUsersByRole = async () => {
      try {
        //Will need to change the route eventually, keep it localhost for now so we can test it.
        //Make sure it matches what is typed in adminRoutes
        const response = await axios.get('http://localhost:5000/admin/users-by-role', {withCredentials: true});
        console.log(response.data.users);

        setUsers(response.data.users);
      }
      catch (error) {
        console.error('Error fetching the users: ', error);
        setError(error.message);
      }
    };

    fetchUsersByRole();
  }, []);

  const handleEdit = (user) => {
    setEditUserID(user.user_id);
    setFormData({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role_name,
    });
  };

  //Submit the updated data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/admin/modify-user/${editUserID}`, formData);
      alert('User modified');
      setEditUserID(null);

      //Fetch users again to display modifications
      const response = await axios.get('http://localhost:5000/admin/users-by-role');
      setUsers(response.data.users);
    }
    catch (err) {
      console.error('Error modifying the user: ', err);
    }
  };

  //Update the formData state when a change is made to a user
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

    return (
      <div>
        <h2>Welcome to the Admin Dashboard!</h2>
        {error && <p>Error: {error}</p>}
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
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
                <td>
                  <button onClick={() => handleEdit(user)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editUserID && (
          <div>
            <h3>Edit User</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label>First Name:</label>
                <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                />
              </div>

              <div>
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              </div>

              <div>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Role:</label>
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="Manager">Manager</option>
                <option value="Accountant">Accountant</option>
              </select>
            </div>
            <button type="submit">Save</button>

            </form>
          </div>
        )}
      </div>
    );
  };

  export default AdminDashboard;

