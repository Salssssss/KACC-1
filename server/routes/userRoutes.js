const express = require('express');
const router = express.Router();
const { login, createAccount } = require('../controllers/userController');

// Route for user login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const pool = req.app.get('dbPool'); // Use the shared DB pool

  try {
    const user = await login(pool, username, password);
    res.json({ message: 'Login successful', user });
  } catch (error) {
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
