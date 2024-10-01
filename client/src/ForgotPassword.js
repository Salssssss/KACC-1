import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null); // To track userId after email submission
  const [step, setStep] = useState(1); // Step 1 = ask for email, Step 2 = security questions
  const navigate = useNavigate();

  // Handle email submission to retrieve security questions or send the reset email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:5000/users/forgot-password', { email });
      
      if (response.data.securityQuestions) {
        // Security questions are present, ask the user to answer them
        setSecurityQuestions(response.data.securityQuestions);
        setUserId(response.data.userId); // Set user ID for further requests
        setStep(2); // Move to the next step
      } else {
        // No security questions, just display the message from the backend
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage('Error processing the request. Please try again.');
    }
  };

  // Handle the submission of the security question answers
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/users/verify-security-answers', {
        userId,
        answers
      });

      if (response.data.success) {
        window.alert('You have been sent a link to reset your password please check your email.');
        navigate('/LandingPage');
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage('Error verifying answers. Please try again.');
    }
  };

  // Update answer state as the user types
  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      {message && <p>{message}</p>}

      {/* Step 1: Ask for the user's email */}
      {step === 1 && (
        <form onSubmit={handleEmailSubmit}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      )}

      {/* Step 2: Display Security Questions if they are available */}
      {step === 2 && securityQuestions.length > 0 && (
        <form onSubmit={handleAnswerSubmit}>
          <h3>Answer the following security questions:</h3>
          {securityQuestions.map((question) => (
            <div key={question.question_id}>
              <label>{question.question_text}</label>
              <input
                type="text"
                value={answers[question.question_id] || ''}
                onChange={(e) => handleAnswerChange(question.question_id, e.target.value)}
                required
              />
            </div>
          ))}
          <button type="submit">Submit Answers</button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
