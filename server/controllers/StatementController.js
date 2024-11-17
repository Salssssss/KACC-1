const sql = require('mssql');

exports.createTrialBalance = async(req, res) => {
    //select all accounts whose normal side is debits
    //select all accounts with credit normal side
    //Sum all debits, compare to sum of all credits
    try {
        const result = await sql.query(`
            SELECT 
                account_id, 
                account_name, 
                SUM(CASE WHEN normal_side = 'debit' THEN balance ELSE 0 END) AS total_debits,
                SUM(CASE WHEN normal_side = 'credit' THEN balance ELSE 0 END) AS total_credits
            FROM 
                accounts 
            GROUP BY 
                account_id, account_name 
        `);

        //Summing both sides for comparison
        //Send this back to the front end so each value can be displayed as well
        const totalDebits = result.recordset.reduce((acc, row) => acc + row.total_debits, 0);
        const totalCredits = result.recordset.reduce((acc, row) => acc + row.total_credits, 0);

        res.status(200).json({ trialBalance: result.recordset, totalDebits, totalCredits, balanced: totalDebits === totalCredits });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error creating trial balance', error });
    }

};

exports.createBalanceSheet = async(req, res) => {
    //select all accounts under category "assets" and put them on left side
    //select all accounts under category "liabilities" or "equities" and put them on right side
    //sum the balance of each side and compare them
    try {
        const assets = await sql.query(`SELECT * FROM accounts WHERE category = 'assets'`);
        const liabilities = await sql.query(`SELECT * FROM accounts WHERE category = 'liabilities'`);
        const equity = await sql.query(`SELECT * FROM accounts WHERE category = 'equity'`);

        //Sum each category, send them back to front end as variables
        const totalAssets = assets.recordset.reduce((acc, account) => acc + account.balance, 0);
        const totalLiabilities = liabilities.recordset.reduce((acc, account) => acc + account.balance, 0);
        const totalEquity = equity.recordset.reduce((acc, account) => acc + account.balance, 0);

        //Assets should equal Liabilities + Equity
        res.status(200).json({
            assets: assets.recordset,
            liabilities: liabilities.recordset,
            equity: equity.recordset,
            totalAssets,
            totalLiabilities,
            totalEquity,
            balanced: totalAssets === (totalLiabilities + totalEquity),
        });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error creating balance sheet', error });
    }
};
const getNetIncome = async (sql) => {
    const revenue = await sql.query(`SELECT * FROM accounts WHERE category = 'revenue'`);
    const expenses = await sql.query(`SELECT * FROM accounts WHERE category = 'expenses'`);

    const totalRevenue = revenue.recordset.reduce((acc, account) => acc + Number(account.balance), 0);
    const totalExpenses = expenses.recordset.reduce((acc, account) => acc + Number(account.balance), 0);
    const netIncome = totalRevenue - totalExpenses;

    return { revenue: revenue.recordset, expenses: expenses.recordset, totalRevenue, totalExpenses, netIncome };
};

exports.createIncomeStatement = async (req, res) => {
    try {
        const netIncomeData = await getNetIncome(sql);

        res.status(200).json({
            revenue: netIncomeData.revenue,
            expenses: netIncomeData.expenses,
            totalRevenue: netIncomeData.totalRevenue,
            totalExpenses: netIncomeData.totalExpenses,
            netIncome: netIncomeData.netIncome,
        });
    } catch (error) {
        console.error('Error creating income statement:', error);
        res.status(500).json({ message: 'Error creating income statement', error });
    }
};

exports.createRetainedEarningsStatement = async (req, res) => {
    try {
        // Load the beginning retained earnings balance
        const beginningRetainedEarnings = await sql.query(`SELECT balance FROM accounts WHERE account_name = 'Retained Earnings'`);
        const beginningBalance = (beginningRetainedEarnings.recordset?.[0]?.balance) || 0;

        // Use the reusable net income calculation
        const netIncomeData = await getNetIncome(sql);
        const netIncome = netIncomeData.netIncome;

        // Calculate dividends (6% payout from beginning balance)
        const dividends = (beginningBalance + netIncome) * 0.06;

        // Calculate retained earnings
        const retainedEarnings = beginningBalance + netIncome - dividends;


        console.log(netIncome, dividends, retainedEarnings)
        // Return the retained earnings statement
        res.status(200).json({
            beginningRetainedEarnings: beginningBalance,
            netIncome: netIncome,
            dividends: dividends,
            retainedEarnings: retainedEarnings,
        });
    } catch (error) {
        console.error('Error creating retained earnings statement:', error);
        res.status(500).json({ message: 'Error creating retained earnings statement', error });
    }
};

exports.updateRetainedEarnings = async (req, res) => {
    try {
        // Load the beginning retained earnings balance
        const beginningRetainedEarnings = await sql.query(`SELECT balance FROM accounts WHERE account_name = 'Retained Earnings'`);
        const beginningBalance = (beginningRetainedEarnings.recordset?.[0]?.balance) || 0;

        // Use the reusable net income calculation
        const netIncomeData = await getNetIncome(sql);
        const netIncome = netIncomeData.netIncome;

        // Calculate dividends (6% payout from beginning balance)
        const dividends = (beginningBalance + netIncome) * 0.06;

        // Calculate retained earnings
        const retainedEarnings = beginningBalance + netIncome - dividends;

        // Save the retained earnings into the 'Retained Earnings' account
        await sql.query(`
            UPDATE accounts 
            SET balance = ${retainedEarnings} 
            WHERE account_name = 'Retained Earnings';
            
            UPDATE accounts 
            SET balance = ${dividends} 
            WHERE account_name = 'Equity';
        `);
        

        // Reset revenue and expense accounts (year-end closing process)
        await sql.query(`UPDATE accounts SET balance = 0 WHERE category IN ('revenue', 'expenses')`);
        res.status(200).json({ message: 'Retained earnings updated successfully.' });
        // Return the retained earnings statement
    } catch (error) {
        console.error('Error creating retained earnings statement:', error);
        res.status(500).json({ message: 'Error creating retained earnings statement', error });
    }
};

