const express = require('express');
const router = express.Router();
const {
    addError,
    addActiveError,
    getActiveErrors,
    resolveError
} = require('../controllers/errorController');

// Add a new error type
router.post('/errors', async (req, res) => {
    const { errorCode, description } = req.body;
    const pool = req.app.get('dbPool');

    const result = await addError(pool, errorCode, description);
    res.status(result.status || 200).json(result);
});

// Add an active error for a journal entry
router.post('/active-errors', async (req, res) => {
    const { journalID, errorID } = req.body;
    const pool = req.app.get('dbPool');

    const result = await addActiveError(pool, journalID, errorID);
    res.status(result.status || 200).json(result);
});

// Get active errors for a user
router.get('/active-errors/:userID', async (req, res) => {
    const { userID } = req.params;
    const pool = req.app.get('dbPool');

    try {
        const result = await getActiveErrors(pool, userID);
        res.status(result.status).json(result);
    } catch (error) {
        console.error('Error in /active-errors/:userID route:', error);
        res.status(500).json({ message: 'Failed to fetch active errors' });
    }
});


// Resolve an active error
router.patch('/resolve-errors/:activeErrorID', async (req, res) => {
    const { activeErrorID } = req.params;
    const { resolutionNotes } = req.body;
    const pool = req.app.get('dbPool');

    const result = await resolveError(pool, activeErrorID, resolutionNotes);
    res.status(result.status || 200).json(result);
});

router.patch('/activate/:journalID/errors/:errorID', async (req, res) => {
    const { journalID, errorID } = req.params;
    const pool = req.app.get('dbPool');
    try {
      // Call the controller/service function to handle the activation
      await addActiveError(pool, journalID, errorID);
  
      res.status(200).json({ message: 'Error activated successfully.' });
    } catch (error) {
      console.error('Error activating error:', error);
      res.status(500).json({ message: 'Failed to activate error.', error });
    }
  });

  router.get('/errors', async (req, res) => {
    const pool = req.app.get('dbPool');
  
    try {
      const result = await pool.query('SELECT error_id, description FROM Errors');
      res.status(200).json(result.recordset);
    } catch (err) {
      console.error('Failed to fetch errors:', err);
      res.status(500).json({ message: 'Failed to fetch errors.' });
    }
  });
  
  // Deactivate an active error
router.patch('/deactivate-errors/:activeErrorID', async (req, res) => {
    const { activeErrorID } = req.params; // Extract activeErrorID from the request
    const pool = req.app.get('dbPool'); // Get the database pool connection

    try {
        const result = await deactivateError(pool, activeErrorID); // Call the controller function
        res.status(result.status || 200).json(result); // Return the result to the client
    } catch (error) {
        console.error('Error deactivating error:', error); // Log the error
        res.status(500).json({ message: 'Failed to deactivate error.', error }); // Return an error response
    }
});

router.get('/active-errors', async (req, res) => {
    const pool = req.app.get('dbPool'); // Get the database pool connection
  
    try {
      const result = await getAllActiveErrors(pool); // Call the controller function
      res.status(result.status || 200).json(result); // Return the result to the client
    } catch (error) {
      console.error('Error in /active-errors route:', error); // Log the error
      res.status(500).json({ message: 'Failed to fetch all active errors' }); // Return an error response
    }
  });
  

  
module.exports = router;
