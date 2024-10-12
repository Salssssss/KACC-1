const express = require('express');
const router = express.Router(); 
const { 
    createAccount, 
    getAccountsByUser,
    editAccount,
    getAccountLedger, 
    getAccountEvents
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

  router.get('/:user_id/accounts', async (req, res) => {
    const pool = req.app.get('dbPool');  // Get the database pool
    const user_id = req.params.user_id;  // Get the user_id from the route parameters
    
    try {
      const accounts = await getAccountsByUser(pool, user_id);  // Call the controller function
      
      if (accounts.message) {
        res.status(404).json({ message: accounts.message });  // Handle case where no accounts are found
      } else {
        res.status(200).json(accounts);  // Return the user's accounts
      }
    } catch (error) {
      console.error('Error fetching accounts for user:', error);
      res.status(500).json({ message: 'Error fetching accounts for user' });
    }
  });

  // PUT route to edit an account
router.put('/edit/:account_id', async (req, res) => {
  const pool = req.app.get('dbPool');  // Get the database pool
  const userId = req.session.user_id;  // Get the user ID from the session
  const { account_id } = req.params;   // Get the account ID from the route parameter

  try {
    await editAccount(pool, account_id, req.body, userId);  // Call the controller to edit the account
    res.status(200).json({ message: 'Account updated successfully' });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ message: 'Error updating account' });
  }
});

router.get('/:account_id/ledger', async (req, res) => {
  const pool = req.app.get('dbPool');
  const { account_id } = req.params;

  try {
    const ledger = await getAccountLedger(pool, account_id);
    res.status(200).json(ledger);
  } catch (error) {
    console.error('Error fetching account ledger:', error);
    res.status(500).json({ message: 'Error fetching account ledger' });
  }
});

// Route to get the account events for an account
router.get('/:account_id/events', async (req, res) => {
  const pool = req.app.get('dbPool');
  const { account_id } = req.params;

  try {
    const events = await getAccountEvents(pool, account_id);
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching account events:', error);
    res.status(500).json({ message: 'Error fetching account events' });
  }
});

module.exports = router;
