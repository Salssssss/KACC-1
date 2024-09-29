const express = require('express');
const router = express.Router();
const { 
  login, 
  createAccount, 
  setPassword, 
  selectSecurityQuestions, 
  getSecurityQuestions
} = require('../controllers/userController');

// Route for user login
// Route for user login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const pool = req.app.get('dbPool'); // Use the shared DB pool

  try {
    const result = await login(pool, username, password);
    const user = result.user;
    console.log(result)

    // Store user information in the session
    req.session.user = {
      id: user.user_id,
      role_name: user.role_name,
    };

    // Save the session and respond to the client only once
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(600).send('Session could not be saved'); 
      }

      res.json(result);
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: error.message });
  }
});


// Route for creating a new account
router.post('/create-account', async (req, res) => {
  const pool = req.app.get('dbPool'); // Use the shared DB pool
  try {
    await createAccount(pool, req.body);
    res.status(201).json({ message: 'Account created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route for setting or resetting a password
router.post('/set-password', async (req, res) => {
  const pool = req.app.get('dbPool'); 
  const { userId, newPassword } = req.body; // The request body should contain the userId and the new password

  try {
    await setPassword(pool, userId, newPassword);
    res.status(200).json({ message: 'Password set successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//route for getting security questions from databasse
router.get('/security-questions', async (req, res) => {
  const pool = req.app.get('dbPool');

  try {
    const result = await getSecurityQuestions(pool); // The result from the controller is already the final data (not recordset)

    // Respond with the list of security questions
    res.status(200).json(result); // Just send the result, as it is already the final recordset from the controller
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error('Error fetching security questions:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});



// Route to select and answer security questions after setting a password
router.post('/select-security-questions', async (req, res) => {
  const { userId, selectedQuestions } = req.body;
    // Validate input
    if (!userId || !Array.isArray(selectedQuestions) || selectedQuestions.length !== 2) {
      return res.status(400).json({ message: 'Invalid input. You must select two security questions.' });
    }
  const pool = req.app.get('dbPool'); 

  try {
    await selectSecurityQuestions(pool, userId, selectedQuestions);
    res.status(200).json({ message: 'Question set succesfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//forgot password route
router.post('/forgot-password', async (req, res) => {
  const { username } = req.body;
  const pool = req.app.get('dbPool');
});
//route for verifying security questions
router.post('/verify-answers', async (req, res) => {
  const { userId, answers } = req.body;
  const pool = req.app.get('dbPool');
});

module.exports = router;
