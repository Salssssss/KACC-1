const sql = require('mssql');

// Function to get all journal entries, with optional filtering by status and date range
exports.getJournalEntries = async (pool, status, dateFrom, dateTo) => {
    try {
        let query = 'SELECT * FROM journal WHERE 1=1';
        if (status) query += ' AND status = @status';
        if (dateFrom) query += ' AND transaction_date >= @dateFrom';
        if (dateTo) query += ' AND transaction_date <= @dateTo';

        const request = new sql.Request(pool);
        if (status) request.input('status', sql.NVarChar, status);
        if (dateFrom) request.input('dateFrom', sql.DateTime, dateFrom);
        if (dateTo) request.input('dateTo', sql.DateTime, dateTo);

        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        return { status: 500, message: 'Error fetching journal entries' };
    }
};

// Function to create a new journal entry
exports.createJournalEntry = async (pool, transactionDate, accounts, debits, credits, journalDescription, createdBy) => {
    let transaction;

    try {
        // Validate that total debits equal total credits
        const totalDebits = debits.reduce((sum, debit) => sum + debit, 0);
        const totalCredits = credits.reduce((sum, credit) => sum + credit, 0);
        if (totalDebits !== totalCredits) {
            return { status: 400, message: 'Total debits must equal total credits for a valid journal entry' };
        }

        // Start a transaction
        transaction = new sql.Transaction(pool);
        await transaction.begin();
        const request = new sql.Request(transaction);

        // Prepare the entries
        const entries = accounts.map((account, index) => ({
            account_id: account,
            debit: debits[index] || 0,
            credit: credits[index] || 0
        }));

        // Insert the journal entry
        const insertJournalQuery = `
            INSERT INTO journal (transaction_date, status, journal_data, created_by, description)
            OUTPUT INSERTED.journal_id
            VALUES (@transactionDate, 'pending', @journalData, @createdBy, @journalDescription)
        `;

        const journalData = JSON.stringify({ entries });
        request.input('transactionDate', sql.DateTime, transactionDate);
        request.input('journalData', sql.NVarChar, journalData);
        request.input('createdBy', sql.Int, createdBy);
        request.input('journalDescription', sql.NVarChar, journalDescription);

        const result = await request.query(insertJournalQuery);
        const journalID = result.recordset[0].journal_id;

        await transaction.commit();
        return { journalID, message: 'Journal entry created successfully' };
    } catch (error) {
        console.error('Error creating journal entry:', error);
        if (transaction) {
            await transaction.rollback();
        }
        return { status: 500, message: 'Error creating journal entry' };
    }
};


// Function to get a single journal entry by ID
exports.getJournalEntryByID = async (pool, id) => {
    try {
        const request = new sql.Request(pool);
        request.input('journalID', sql.Int, id);
        const query = 'SELECT description, transaction_date, created_at, file_name, file_type, status, journal_data FROM journal WHERE journal_id = @journalID';

        const result = await request.query(query);
        return result.recordset[0] || { message: 'Journal entry not found' };
    } catch (error) {
        console.error('Error fetching journal entry by ID:', error);
        return { status: 500, message: 'Error fetching journal entry by ID' };
    }
};


// Function to approve a journal entry and create ledger entries
exports.approveJournalEntry = async (pool, journalID) => {
    let transaction;

    try {
        // Start a transaction
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Fetch the journal entry to get `createdBy`
        let request = new sql.Request(transaction);
        request.input('journalID', sql.Int, journalID);
        const fetchJournalQuery = 'SELECT journal_data, created_by FROM journal WHERE journal_id = @journalID';
        const journalResult = await request.query(fetchJournalQuery);

        if (journalResult.recordset.length === 0) {
            throw new Error('Journal entry not found');
        }

        const journalData = JSON.parse(journalResult.recordset[0].journal_data);
        const createdBy = journalResult.recordset[0].created_by;

        // Update the journal entry status to 'approved'
        request = new sql.Request(transaction);
        request.input('journalID', sql.Int, journalID);
        const updateJournalQuery = "UPDATE journal SET status = 'approved' WHERE journal_id = @journalID";
        await request.query(updateJournalQuery);

        // Insert ledger entries linked to this journal entry and update account balances
        const { entries } = journalData;
        for (const entry of entries) {
            const { account_id, debit, credit } = entry;

            // Calculate the new balance for the account
            request = new sql.Request(transaction);
            request.input('accountID', sql.Int, account_id);
            const fetchAccountQuery = 'SELECT balance FROM accounts WHERE account_id = @accountID';
            const accountResult = await request.query(fetchAccountQuery);
            const currentBalance = accountResult.recordset[0].balance;
            const newBalance = currentBalance + debit - credit;

            // Insert the ledger entry
            request = new sql.Request(transaction);
            request.input('journalID', sql.Int, journalID);
            request.input('accountID', sql.Int, account_id);
            request.input('debit', sql.Decimal(18, 2), debit);
            request.input('credit', sql.Decimal(18, 2), credit);
            request.input('newBalance', sql.Decimal(18, 2), newBalance);
            const insertLedgerQuery = `
                INSERT INTO ledger_entries (journal_id, account_id, debit, credit, entry_date, balance_after)
                VALUES (@journalID, @accountID, @debit, @credit, SYSDATETIME(), @newBalance)
            `;
            await request.query(insertLedgerQuery);

            // Update the account balance
            request = new sql.Request(transaction);
            request.input('newBalance', sql.Decimal(18, 2), newBalance);
            request.input('accountID', sql.Int, account_id);
            const updateAccountQuery = `
                UPDATE accounts
                SET balance = @newBalance
                WHERE account_id = @accountID
            `;
            await request.query(updateAccountQuery);

            // Insert account event
            request = new sql.Request(transaction);
            request.input('accountID', sql.Int, account_id);
            request.input('currentBalance', sql.Decimal(18, 2), currentBalance);
            request.input('newBalance', sql.Decimal(18, 2), newBalance);
            request.input('createdBy', sql.Int, createdBy);
            const insertAccountEventQuery = `
                INSERT INTO account_events (account_id, before_image, after_image, changed_by_user_id, event_time)
                VALUES (@accountID, @currentBalance, @newBalance, @createdBy, SYSDATETIME())
            `;
            await request.query(insertAccountEventQuery);
        }

        await transaction.commit();
        return { message: 'Journal entry approved, ledger entries created, account balances updated, and account events recorded successfully' };
    } catch (error) {
        console.error('Error approving journal entry:', error);
        if (transaction) {
            await transaction.rollback();
        }
        return { status: 500, message: 'Error approving journal entry' };
    }
};



// Function to reject a journal entry with a comment
exports.rejectJournalEntry = async (pool, journalID, comment) => {
    try {
        const request = new sql.Request(pool);
        request.input('journalID', sql.Int, journalID);
        request.input('comment', sql.NVarChar, comment);
        const query = "UPDATE journal SET status = 'rejected', journal_data = JSON_MODIFY(journal_data, '$.rejectionComment', @comment) WHERE journal_id = @journalID";

        await request.query(query);
        return { message: 'Journal entry rejected successfully' };
    } catch (error) {
        console.error('Error rejecting journal entry:', error);
        return { status: 500, message: 'Error rejecting journal entry' };
    }
};


// Function to filter journal entries by status and date range
exports.filterJournalEntries = async (pool, status, dateFrom, dateTo) => {
    return await exports.getJournalEntries(pool, status, dateFrom, dateTo);
};

// Function to search journal entries by account name, amount, or date
exports.searchJournalEntries = async (pool, query) => {
    try {
        const request = new sql.Request(pool);
        request.input('query', sql.NVarChar, `%${query}%`);
        const sqlQuery = `
            SELECT * FROM journal
            WHERE journal_data LIKE @query OR description LIKE @query
        `;

        const result = await request.query(sqlQuery);
        return result.recordset;
    } catch (error) {
        console.error('Error searching journal entries:', error);
        return { status: 500, message: 'Error searching journal entries' };
    }
};

// Function to attach source documents to a journal entry
//I might move this into the createJournal controller depending on how the uplaod works
exports.attachSourceDocuments = async (pool, journalID, fileName, fileType, fileData) => {
    try {
        const request = new sql.Request(pool);
        request.input('journalID', sql.Int, journalID);
        request.input('fileName', sql.NVarChar, fileName);
        request.input('fileType', sql.NVarChar, fileType);
        request.input('fileData', sql.VarBinary, fileData);

        const query = `
            UPDATE journal 
            SET 
                file_name = @fileName, 
                file_type = @fileType, 
                file_data = @fileData 
            WHERE journal_id = @journalID
        `;
        await request.query(query);

        return { message: 'Source document attached successfully' };
    } catch (error) {
        console.error('Error attaching source documents:', error);
        return { status: 500, message: 'Error attaching source documents' };
    }
};


