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
        //Select and categorize accounts
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

exports.createIncomeStatement = async(req, res) => {
    //Select all accounts under category "revenue" and sum their balance
    //Select all accounts under category "expenses" and sum their balance
    //Subtract sum of expenses from sum of revenue
    //save total as net income/loss
    try {
        //Store details of accounts in these categories in the revenue and expenses arrays
        //In the front end we can iterate over and display the names of each account as well as their balance
        const revenue = await sql.query(`SELECT * FROM accounts WHERE category = 'revenue'`);
        const expenses = await sql.query(`SELECT * FROM accounts WHERE category = 'expenses'`);

        //The summed values and net result can be sent back to the front end as well
        const totalRevenue = revenue.recordset.reduce((acc, account) => acc + account.balance, 0);
        const totalExpenses = expenses.recordset.reduce((acc, account) => acc + account.balance, 0);
        const netResult = totalRevenue - totalExpenses;

        res.status(200).json({ revenue: revenue.recordset, expenses: expenses.recordset, netResult });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error creating income statement', error });
    }
};

exports.createRetainedEarningsStatement = async(req, res) => {
    //load saved retained earnings from the beginning of the year (if applicable)
    //add net income/loss from most recent income statement
    //save result so it can be displayed
    //subtract 6% from the result and label the amount as dividends
    //save final result as the retained earnings and zero out all revenue and expenses accounts
    try {
        //Assuming we load beginning retained earnings from a saved source
        //Technically the balance in retained earnings could be zero if there was no retained earnings last year
        const beginningRetainedEarnings = await sql.query(`SELECT balance FROM accounts WHERE account_name = 'Retained Earnings'`);
        
        //?. is balanced chaining
        //IF recordset[0] exists, then ?.balance accesses the balance property of the row
        //If balance is undefined, set to zero
        const beginningBalance = beginningRetainedEarnings.recordset[0]?.balance || 0;

        //Retrieve the most recent net income 
        //We might want to store net income in a dedicated account after income statement creation
        const netIncome = await this.createIncomeStatement(req, res);

        //Subtract dividends (using a 6% rate as the dividend payout)
        const dividends = beginningBalance * 0.06;
        const retainedEarnings = beginningBalance + netIncome - dividends;

        //Reset revenue and expense accounts (year-end closing process)
        await sql.query(`UPDATE accounts SET balance = 0 WHERE category IN ('revenue', 'expenses')`);

        res.status(200).json({
            beginningRetainedEarnings: beginningBalance,
            netIncome,
            dividends,
            retainedEarnings,
        });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error creating retained earnings statement', error });
    }
};