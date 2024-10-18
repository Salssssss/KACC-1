import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateProfile = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState(''); // Date of birth added
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // initiate useNavigate for redirection

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:5000/users/create-profile', {
        firstName,
        lastName,
        dob,
        address,
        email,
      });

      setMessage(response.data.message);

      if (response.data.message === 'Profile created successfully. Awaiting admin approval.') {
        // Show an alert with the message
        window.alert('Your Profile is pending approval. You will receive an email from an admin once your Profile has been accepted.');
        
        // Navigate the user back to the login page after they close the alert
        navigate('/LandingPage');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setMessage('Profile creation failed: ' + error.response.data.message);
      } else {
        setMessage('Error connecting to server');
      }
    }
  };

  return (
    <div className="createProfile">
      <h2>Create Profile</h2>
      <form onSubmit={handleCreateProfile}>
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
        <button type="submit">Create Profile</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateProfile;
