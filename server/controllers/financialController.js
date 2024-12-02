const getRevenueData = async (req, res) => {
  const pool = req.app.get('dbPool');

  try {
    const query = `
      SELECT 
        FORMAT(entry_date, 'MMM') AS month, 
        SUM(credit) AS revenue
      FROM ledger_entries
      INNER JOIN accounts ON accounts.account_id = ledger_entries.account_id
      WHERE accounts.statement = 'IS'
      GROUP BY FORMAT(entry_date, 'MMM'), DATEPART(MONTH, entry_date)
      ORDER BY DATEPART(MONTH, entry_date);
    `;

    const result = await pool.query(query);
    console.log('Query result:', result.recordset); // Logs the correct result
    res.status(200).json(result.recordset); // Sends the data to the frontend
  } catch (err) {
    console.error('Failed to fetch revenue data:', err);
    res.status(500).json({ message: 'Failed to fetch revenue data.' });
  }
};



const getDivisionRevenueData = async (req, res) => {
  const pool = req.app.get('dbPool');

  try {
    const query = `
      SELECT 
        category AS division, 
        SUM(balance) AS value
      FROM accounts
      WHERE statement = 'IS'
      GROUP BY category;
    `;
    const result = await pool.query(query);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Failed to fetch division revenue data:', err);
    res.status(500).json({ message: 'Failed to fetch division revenue data.' });
  }
};

const getExpenseData = async (req, res) => {
  const pool = req.app.get('dbPool');

  try {
      const query = `
SELECT 
    accounts.account_name AS type,
    SUM(debit) AS total,
    SUM(CASE WHEN MONTH(entry_date) = 1 THEN debit ELSE 0 END) AS jan,
    SUM(CASE WHEN MONTH(entry_date) = 2 THEN debit ELSE 0 END) AS feb,
    SUM(CASE WHEN MONTH(entry_date) = 3 THEN debit ELSE 0 END) AS mar,
    SUM(CASE WHEN MONTH(entry_date) = 4 THEN debit ELSE 0 END) AS apr,
    SUM(CASE WHEN MONTH(entry_date) = 5 THEN debit ELSE 0 END) AS may,
    SUM(CASE WHEN MONTH(entry_date) = 6 THEN debit ELSE 0 END) AS jun,
    SUM(CASE WHEN MONTH(entry_date) = 7 THEN debit ELSE 0 END) AS jul,
    SUM(CASE WHEN MONTH(entry_date) = 8 THEN debit ELSE 0 END) AS aug,
    SUM(CASE WHEN MONTH(entry_date) = 9 THEN debit ELSE 0 END) AS sep,
    SUM(CASE WHEN MONTH(entry_date) = 10 THEN debit ELSE 0 END) AS oct,
    SUM(CASE WHEN MONTH(entry_date) = 11 THEN debit ELSE 0 END) AS nov,
    SUM(CASE WHEN MONTH(entry_date) = 12 THEN debit ELSE 0 END) AS dec
FROM ledger_entries
INNER JOIN accounts ON accounts.account_id = ledger_entries.account_id
WHERE accounts.category = 'expenses'
  AND YEAR(entry_date) = YEAR(GETDATE()) -- Filter for the current year
GROUP BY accounts.account_name;
      `;

      const result = await pool.query(query);
      res.status(200).json(result.recordset);
  } catch (err) {
      console.error('Failed to fetch expense data:', err);
      res.status(500).json({ message: 'Failed to fetch expense data.' });
  }
};



module.exports = {
  getRevenueData,
  getDivisionRevenueData,
  getExpenseData,
};
