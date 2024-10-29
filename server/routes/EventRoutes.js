const express = require('express');
const router = express.Router();
const { getEventLogsByAccount } = require('../controllers/EventController');

// Route to fetch event logs for a specific account
router.get('/event-logs/:account_id', getEventLogsByAccount);

module.exports = router;
