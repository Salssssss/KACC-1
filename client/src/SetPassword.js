import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

//testing set password with modal effect
const SetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // To control modal visibility
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const modalRef = useRef(); // Ref to handle modal clicks

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/users/set-password', {
        userId,
        newPassword,
      });
      setMessage(response.data.message);
      setShowModal(true); // Show modal on successful password set
    } catch (error) {
      setMessage(error.response.data.message);
    }
  };

  // Close modal and navigate to login page when clicking outside the modal
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShowModal(false);
      navigate('/login');
    }
  };

  useEffect(() => {
    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  return (
    <div>
      <h2>Set Your Password</h2>
      <form onSubmit={handleSubmit}>
        <label>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <label>Retype New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Submit</button>
      </form>

      {message && <p>{message}</p>}

      {/* Modal for successful password set */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" ref={modalRef}>
            <h3>Password Successfully Set!</h3>
            <p>Your password has been successfully updated. You will now be redirected to the login page.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetPassword;
