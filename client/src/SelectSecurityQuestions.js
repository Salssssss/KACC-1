import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SelectSecurityQuestions = () => {
  const [questions, setQuestions] = useState([]); // List of all security questions from the server
  const [selectedQuestions, setSelectedQuestions] = useState([
    { questionId: '', answer: '' },
    { questionId: '', answer: '' }
  ]); // Array of two selected questions
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId'); // Example: http://localhost:3000/select-security-questions?userId=25

  // Fetch security questions when component mounts
  useEffect(() => {
    const fetchSecurityQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users/security-questions');
        console.log(response.data)
        setQuestions(response.data); // Ensure the response is an array
      } catch (error) {
        setMessage('Error fetching security questions');
      }
    };
  
    fetchSecurityQuestions();
  }, []); // Empty array ensures it runs only once
  

  // Handle selection of questions from the dropdowns
  const handleQuestionChange = (index, questionId) => {
    const updatedQuestions = [...selectedQuestions];
    updatedQuestions[index].questionId = questionId;
    setSelectedQuestions(updatedQuestions);
  };

  // Handle answer input for selected questions
  const handleAnswerChange = (index, value) => {
    const updatedQuestions = [...selectedQuestions];
    updatedQuestions[index].answer = value;
    setSelectedQuestions(updatedQuestions);
  };

  // Submit selected questions and answers
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      selectedQuestions.some(q => q.questionId === '' || q.answer === '') ||
      selectedQuestions[0].questionId === selectedQuestions[1].questionId
    ) {
      setMessage('Please select and answer two different questions.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/users/select-security-questions', {
        userId,
        selectedQuestions: selectedQuestions.map(q => ({ questionId: q.questionId, answer: q.answer }))
      });
      setMessage('questions saved succesfully');
      navigate('/dashboard'); // Redirect to dashboard or login page after completion
    } catch (error) {
      setMessage(error.response.data.message || 'Error saving security questions');
    }
  };

  return (
    <div>
      <h2>Select and Answer 2 Security Questions</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        {/* First Dropdown and Answer */}
        <div>
          <label>Question 1:</label>
          <select
            value={selectedQuestions[0].questionId}
            onChange={(e) => handleQuestionChange(0, e.target.value)}
            required
          >
            <option value="">Select a question</option>
            {questions && questions.length > 0 ? (
              questions.map((question) => (
                <option key={question.question_id} value={question.question_id}>
                  {question.question_text} {/* Only show question_text */}
                </option>
              ))
            ) : (
              <option disabled>Loading questions...</option>
            )}
          </select>

          {/* Answer for Question 1 */}
          <input
            type="text"
            value={selectedQuestions[0].answer}
            onChange={(e) => handleAnswerChange(0, e.target.value)}
            placeholder="Answer question 1"
            required
          />
        </div>

        {/* Second Dropdown and Answer */}
        <div>
          <label>Question 2:</label>
          <select
            value={selectedQuestions[1].questionId}
            onChange={(e) => handleQuestionChange(1, e.target.value)}
            required
          >
            <option value="">Select a question</option>
            {questions && questions.length > 0 ? (
              questions.map((question) => (
                <option key={question.question_id} value={question.question_id}>
                  {question.question_text} {/* Only show question_text */}
                </option>
              ))
            ) : (
              <option disabled>Loading questions...</option>
            )}
          </select>

          {/* Answer for Question 2 */}
          <input
            type="text"
            value={selectedQuestions[1].answer}
            onChange={(e) => handleAnswerChange(1, e.target.value)}
            placeholder="Answer question 2"
            required
          />
        </div>

        <button type="submit">Submit Answers</button>
      </form>
    </div>
  );
};

export default SelectSecurityQuestions;
