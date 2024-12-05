const express = require('express');
const router = express.Router();
const {
    getRevenueData,
    getDivisionRevenueData,
    getExpenseData,
} = require('../controllers/financialController');

// Revenue Data for Bar Chart
router.get('/revenue', getRevenueData);

// Division Revenue Data for Pie Chart
router.get('/division-revenue', getDivisionRevenueData);

// Expense Breakdown for Table
router.get('/expenses', getExpenseData);

module.exports = router;
