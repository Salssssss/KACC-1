const express = require('express');
const router = express.Router();
const StatementController = require('../controllers/StatementController');

//Route to create a Trial Balance
router.get('/trial-balance', StatementController.createTrialBalance);

//Route to create a Balance Sheet
router.get('/balance-sheet', StatementController.createBalanceSheet);

//Route to create an Income Statement
router.get('/income-statement', StatementController.createIncomeStatement);

//Route to create a Retained Earnings Statement
router.get('/retained-earnings-statement', StatementController.createRetainedEarningsStatement);

module.exports = router;
