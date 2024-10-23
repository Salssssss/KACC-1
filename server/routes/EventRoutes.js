const express = require('express');
const router = express.Router();
const { getEventLogsByTeam } = require('../controllers/EventController');

//Route to fetch event logs for a specific team
router.get('/:teamID', getEventLogsByTeam);

module.exports = router;
