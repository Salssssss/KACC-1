const express = require('express');
const router = express.Router();
const { login, createAccount } = require('../controllers/userController');

// Route for user login
// Route for user login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const pool = req.app.get('dbPool'); // Use the shared DB pool

  try {
    const result = await login(pool, username, password);
    const user = result.user;

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

      res.json({ message: 'Login successful', user });
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

module.exports = router;
