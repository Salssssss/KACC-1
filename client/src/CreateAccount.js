import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateAccount = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState(''); // Date of birth added
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // initiate useNavigate for redirection

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:5000/users/create-account', {
        firstName,
        lastName,
        dob,
        address,
        email,
      });

      setMessage(response.data.message);

      if (response.data.message === 'Account created successfully. Awaiting admin approval.') {
        // Optionally, navigate to a "Thank you" or information page
        navigate('/account-pending');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setMessage('Account creation failed: ' + error.response.data.message);
      } else {
        setMessage('Error connecting to server');
      }
    }
  };

  return (
    <div className="createAccount">
      <h2>Create Account</h2>
      <form onSubmit={handleCreateAccount}>
        <div>
          <label>First Name:</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>
        <div>
          <label>Last Name:</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <div>
          <label>Date of Birth:</label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
        </div>
        <div>
          <label>Address:</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit">Create Account</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateAccount;
