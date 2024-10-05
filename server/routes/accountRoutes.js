const express = require('express');
const router = express.Router(); 
const { 
    createAccount 
} = require('../controllers/accountController');

// POST route for creating a new account
router.post('/create', async (req, res) => {
    const pool = req.app.get('dbPool');  // Get the database pool from app settings
      
    try {
      await createAccount(pool, req.body);  // Call the createAccount function and pass the pool
      res.status(201).json({ message: 'Account created successfully' });
    } catch (error) {
      console.error('Error during POST /create:', error);  // Log the actual error for debugging
      res.status(400).json({ message: error.message || 'An error occurred during account creation' });
    }
  });



module.exports = router;
