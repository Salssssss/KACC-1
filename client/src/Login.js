import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate for redirection

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/users/login', {
        username,
        password
      }, {
        withCredentials: true
      });
      setMessage(response.data.message);

      //Adding 9/20/24 to check if a user is an admin - Ian
      const user = response.data.user;
      console.log('Logged in user:', user);
      localStorage.setItem('userRole', user.role_name);

      if (response.data.message === 'Login successful') {
        console.log(user.role_name);
        if(user.role_name === 'administrator') {
          navigate('/admin-dashboard')
        }
        else{
          navigate('/dashboard')
        }
      }

    } catch (error) {
      if (error.response.data.message === 'Your account has been locked due to too many failed login attempts.') {
        setMessage('Your account is locked. Please contact support.');
      } else if (error.response.data.message === 'Your password has expired. Please reset your password.') {
        setMessage('Your password is expired. Please reset it.');
        // Redirect to password reset page
        navigate('/reset-password');
      } else {
        setMessage(error.response.data.message);
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
