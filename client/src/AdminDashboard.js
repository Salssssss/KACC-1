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
    username: '',
    email: '',
    role: '',
  });


  //Adding this state to show or hide the create user form - Ian 9/27/24
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);

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

  //--------Edit users--------------------------------------------------------------------------------------------------------------

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

  //--------Create a new user--------------------------------------------------------------------------------------------------------------

  //Adding this to handle the user creation form submission from the admin page - Ian 9/27/24
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/admin/create-user', formData, {withCredentials: true});
      alert('User created successfully');
      //Hide form after submission
      setShowCreateUserForm(false); 
      //Fetch the updated users list
      const response = await axios.get('http://localhost:5000/admin/users-by-role');
      setUsers(response.data.users);
    } catch (err) {
      console.error('Error creating the user: ', err);
      alert('Error creating user. Please try again.');
    }
  };

  //--------View All Users Report--------------------------------------------------------------------------------------------------------------

  //State to hold report data for users report
  const [reportData, setReportData] = useState(null);
  //State to handle loading for users report
  const [loading, setLoading] = useState(false);

  const fetchAllUsersReport = async () => {
    //Set loading to true before fetching
    setLoading(true); 
    try {
      const response = await axios.get('http://localhost:5000/admin/get-report-of-users', { withCredentials: true });
      console.log('Users Report: ', response.data);
      //Store the report data in state
      setReportData(response.data); 
    } catch (error) {
      console.error('Error fetching all users report: ', error);
      setError(error.message);
    } finally {
      //Setloading to false after fetching
      setLoading(false); 
    }
  };
  
//--------Expired Passwords Report--------------------------------------------------------------------------------------------------------------

  const [expiredPasswords, setExpiredPasswords] = useState([]);
  const [loadingExpired, setLoadingExpired] = useState(false);
  const [errorExpired, setErrorExpired] = useState(null);

  const fetchExpiredPasswordsReport = async () => {
    //Set loading to true before fetching
    setLoadingExpired(true); 
    try {
      const response = await axios.get('http://localhost:5000/admin/get-report-of-passwords', { withCredentials: true });
      console.log('Expired Passwords Report: ', response.data.expiredPasswords);
      //Store the expired passwords data in state
      setExpiredPasswords(response.data.expiredPasswords); 
    } catch (error) {
      console.error('Error fetching expired passwords report: ', error);
      setErrorExpired(error.message);
    } finally {
      //Set loading to false after fetching
      setLoadingExpired(false); 
    }
  };

  //------------Active or Deactivate a user
  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
  
    try {
      await axios.put(`http://localhost:5000/admin/activate-or-deactivate-user/${user.user_id}`, { status: newStatus }, { withCredentials: true });
      
      alert(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
  
      //Fetch the updated users list
      const response = await axios.get('http://localhost:5000/admin/users-by-role');
      setUsers(response.data.users);
    } catch (err) {
      console.error('Error updating user status: ', err);
      alert('Error updating user status');
    }
  };

  //----------------------HTML and UI------------------------------------------------------------------------------

    return (
      <div>
        <h2>Welcome to the Admin Dashboard!</h2>
        {error && <p>Error: {error}</p>}

        {/*USER REPORT GENERATION */}
        <button onClick={fetchAllUsersReport}>Generate Report of All Users</button>

         {/* Show loading indicator if fetching report */}
         {loading && <p>Loading report...</p>}
      
        {/* Display report data if available */}
        {reportData && (
          <div>
            <h3>User Report</h3>
            <pre>{JSON.stringify(reportData, null, 2)}</pre> {/* We definitely want to come back and edit this to look nicer */}
          </div>
        )}

{/*Table with user info and buttons to edit, activate, or deactivate user accounts */}
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
                  <button onClick={() => handleToggleStatus(user)}> {user.status === 'active' ? 'Inactive' : 'Active'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
      {/* Button to fetch the expired passwords report */}
      <button onClick={fetchExpiredPasswordsReport}>Generate Expired Passwords Report</button>

      {/* Show loading indicator if fetching report */}
      {loadingExpired && <p>Loading expired passwords report...</p>}

      {/* Display expired passwords report if available */}
      {expiredPasswords.length > 0 && (
        <div>
          <h3>Expired Passwords Report</h3>
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Password Created At</th>
              </tr>
            </thead>
            <tbody>
              {expiredPasswords.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>{user.first_name}</td>
                  <td>{user.last_name}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Show error message if something went wrong */}
      {errorExpired && <p>Error: {errorExpired}</p>}
    </div>


 {/*Button to show the "Create New User" form - Ian 9/27/24*/}
 <button onClick={() => setShowCreateUserForm(true)}>Create New User</button>

{/*Conditionally renders the form if showCreateUserForm is true. That way it's hidden most of the time*/}
{showCreateUserForm && (
  <div>
    <h3>Create New User</h3>
    <form onSubmit={handleCreateUser}>
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
        <label>Username:</label>
        <input
          type="text"
          name="username"
          value={formData.username}
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
          <option value="">Select Role</option>
          <option value="Manager">Manager</option>
          <option value="Accountant">Accountant</option>
        </select>
      </div>

      <button type="submit">Create User</button>
    </form>
  </div>
)};
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

