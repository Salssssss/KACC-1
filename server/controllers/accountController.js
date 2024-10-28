const sql = require('mssql');

exports.createAccount = async (pool, accountData, user_id) => {
  const {
    account_name,
    account_number,
    account_description,
    normal_side,
    category,
    subcategory,
    initial_balance,
    team_id,
    order,
    statement
  } = accountData;
  let transaction;  // Declare the transaction variable

  try {
    // Begin a transaction to ensure both account creation and event logging happen together
    transaction = pool.transaction();  // Create a new transaction from the pool
    await transaction.begin();  // Begin the transaction

    // Insert the new account
    const result = await transaction.request()
      .input('account_name', sql.VarChar, account_name)
      .input('account_number', sql.VarChar, account_number)
      .input('account_description', sql.VarChar, account_description)
      .input('normal_side', sql.VarChar, normal_side)
      .input('category', sql.VarChar, category)
      .input('subcategory', sql.VarChar, subcategory)
      .input('initial_balance', sql.Decimal(15, 2), initial_balance)
      .input('balance', sql.Decimal(15, 2), initial_balance)
      .input('team_id', sql.Int, team_id)
      .input('order', sql.Int, order)
      .input('statement', sql.VarChar, statement)
      .query(`INSERT INTO accounts 
              (account_name, account_number, account_description, normal_side, category, subcategory, initial_balance, balance, team_id, [order], statement, created_at, updated_at)
              OUTPUT INSERTED.account_id
              VALUES (@account_name, @account_number, @account_description, @normal_side, @category, @subcategory, @initial_balance, @balance, @team_id, @order, @statement, GETDATE(), GETDATE())`);

    // Extract the account ID from the result
    const accountId = result.recordset[0].account_id;

    // Insert the account event (creation event, so before_image will be NULL)
    await transaction.request()
      .input('account_id', sql.Int, accountId)
      .input('before_image', sql.VarChar, null)  // No before image since it's a new account
      .input('after_image', sql.VarChar, JSON.stringify({
        account_name,
        account_number,
        account_description,
        normal_side,
        category,
        subcategory,
        initial_balance,
        user_id,
        order,
        statement
      }))  // After image will contain the account data
      .input('changed_by_user_id', sql.Int, user_id)  // The user who created the account
      .input('event_time', sql.DateTime, new Date())  // Current timestamp
      .query(`INSERT INTO account_events (account_id, before_image, after_image, changed_by_user_id, event_time)
              VALUES (@account_id, @before_image, @after_image, @changed_by_user_id, @event_time)`);

    // Commit the transaction
    await transaction.commit();
  } catch (error) {
    console.error('Error during account creation and event logging:', error);
    if (transaction) {
      await transaction.rollback();  // Roll back the transaction if something goes wrong
    }
    throw error;
  }
};



// Controller to retrieve accounts for a specific user's team
exports.getAccountsByUser = async (pool, user_id) => {
  try {
    // First, get the team_id from the team_members table for the user
    const teamResult = await pool.request()
      .input('user_id', sql.Int, user_id)
      .query('SELECT team_id FROM team_members WHERE user_id = @user_id');

    const team = teamResult.recordset[0];  // Get the team_id

    if (!team) {
      return { message: 'No team found for this user' };
    }

    const team_id = team.team_id;

    // Now retrieve the accounts for that team_id
    const accountsResult = await pool.request()
      .input('team_id', sql.Int, team_id)
      .query('SELECT * FROM accounts WHERE team_id = @team_id');

    const accounts = accountsResult.recordset;  // Get the account from the result

    if (!accounts || accounts.length === 0) {
      return { message: 'No accounts found for this team' };
    }

    return accounts;  // Return the accounts for the team
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
};

exports.editAccount = async (pool, account_id, newAccountData, changed_by_user_id) => {
  let transaction;

  try {
    // Start transaction
    transaction = pool.transaction();
    await transaction.begin();

    // Fetch the current state of the account (before the edit)
    const currentAccountResult = await transaction.request()
      .input('account_id', sql.Int, account_id)
      .query('SELECT * FROM accounts WHERE account_id = @account_id');
    
    if (currentAccountResult.recordset.length === 0) {
      throw new Error('Account not found');
    }

    const currentAccount = currentAccountResult.recordset[0];

    // Merge current account data with new data, only updating provided fields
    const updatedAccount = {
      account_name: newAccountData.account_name || currentAccount.account_name,
      account_number: newAccountData.account_number || currentAccount.account_number,
      account_description: newAccountData.account_description || currentAccount.account_description,
      normal_side: newAccountData.normal_side || currentAccount.normal_side,
      category: newAccountData.category || currentAccount.category,
      subcategory: newAccountData.subcategory || currentAccount.subcategory,
      initial_balance: newAccountData.initial_balance !== undefined ? newAccountData.initial_balance : currentAccount.initial_balance,
      balance: newAccountData.balance !== undefined ? newAccountData.balance : currentAccount.balance,
      order: newAccountData.order || currentAccount.order,
      statement: newAccountData.statement || currentAccount.statement
    };

    // Create before_image from the current account state
    const beforeImage = JSON.stringify(currentAccount);

    // Update the account with the new values
    await transaction.request()
      .input('account_name', sql.VarChar, updatedAccount.account_name)
      .input('account_number', sql.VarChar, updatedAccount.account_number)
      .input('account_description', sql.VarChar, updatedAccount.account_description)
      .input('normal_side', sql.VarChar, updatedAccount.normal_side)
      .input('category', sql.VarChar, updatedAccount.category)
      .input('subcategory', sql.VarChar, updatedAccount.subcategory)
      .input('initial_balance', sql.Decimal(15, 2), updatedAccount.initial_balance)
      .input('balance', sql.Decimal(15, 2), updatedAccount.balance)
      .input('order', sql.Int, updatedAccount.order)
      .input('statement', sql.VarChar, updatedAccount.statement)
      .input('account_id', sql.Int, account_id)
      .query(`UPDATE accounts 
              SET account_name = @account_name,
                  account_number = @account_number,
                  account_description = @account_description,
                  normal_side = @normal_side,
                  category = @category,
                  subcategory = @subcategory,
                  initial_balance = @initial_balance,
                  balance = @balance,
                  [order] = @order,
                  statement = @statement,
                  updated_at = GETDATE()
              WHERE account_id = @account_id`);

    // Create after_image from the updated account data
    const afterImage = JSON.stringify(updatedAccount);

    // Insert the event into account_events
    await transaction.request()
      .input('account_id', sql.Int, account_id)
      .input('before_image', sql.VarChar, beforeImage)
      .input('after_image', sql.VarChar, afterImage)
      .input('changed_by_user_id', sql.Int, changed_by_user_id)
      .input('event_time', sql.DateTime, new Date())
      .query(`INSERT INTO account_events (account_id, before_image, after_image, changed_by_user_id, event_time)
              VALUES (@account_id, @before_image, @after_image, @changed_by_user_id, @event_time)`);

    // Commit the transaction
    await transaction.commit();

  } catch (error) {
    if (transaction) await transaction.rollback();  // Rollback the transaction if an error occurs
    console.error('Error during account edit and event logging:', error);
    throw error;
  }
};

//get ledger
exports.getAccountLedger = async (pool, account_id) => {
  try {
    const result = await pool.request()
      .input('account_id', sql.Int, account_id)
      .query(`SELECT *
              FROM ledger_entries  
              WHERE account_id = @account_id
              ORDER BY entry_date ASC`);

    return result.recordset;  // Return the ledger entries for the account
  } catch (error) {
    console.error('Error fetching account ledger:', error);
    throw error;
  }
};

 //get account events
 exports.getAccountEvents = async (pool, account_id) => {
  try {
    const result = await pool.request()
      .input('account_id', sql.Int, account_id)
      .query(`SELECT event_id, before_image, after_image, changed_by_user_id, event_time
              FROM account_events
              WHERE account_id = @account_id
              ORDER BY event_time DESC`);

    return result.recordset;  // Return the account events for the account
  } catch (error) {
    console.error('Error fetching account events:', error);
    throw error;
  }
};
  
exports.deactivateAccount = async (pool, account_id, changed_by_user_id) => {
  let transaction;

  try {
    // Begin a transaction to ensure atomicity
    transaction = pool.transaction();
    await transaction.begin();

    // Check the current balance of the account
    const accountResult = await transaction.request()
      .input('account_id', sql.Int, account_id)
      .query('SELECT balance FROM accounts WHERE account_id = @account_id');

    if (accountResult.recordset.length === 0) {
      throw new Error('Account not found');
    }

    const currentBalance = accountResult.recordset[0].balance;

    // If the balance is greater than zero, throw an error
    if (currentBalance > 0) {
      throw new Error('Account cannot be deactivated as the balance is greater than zero');
    }

    // Deactivate the account
    await transaction.request()
      .input('account_id', sql.Int, account_id)
      .query(`UPDATE accounts SET is_active = 0, updated_at = GETDATE() WHERE account_id = @account_id`);

    // Log the deactivation event in account_events
    await transaction.request()
      .input('account_id', sql.Int, account_id)
      .input('before_image', sql.VarChar, JSON.stringify({ is_active: 1 })) // Before deactivation
      .input('after_image', sql.VarChar, JSON.stringify({ is_active: 0 })) // After deactivation
      .input('changed_by_user_id', sql.Int, changed_by_user_id)
      .input('event_time', sql.DateTime, new Date())
      .query(`INSERT INTO account_events (account_id, before_image, after_image, changed_by_user_id, event_time)
              VALUES (@account_id, @before_image, @after_image, @changed_by_user_id, @event_time)`);

    // Commit the transaction
    await transaction.commit();
  } catch (error) {
    console.error('Error during account deactivation:', error);
    if (transaction) {
      await transaction.rollback(); // Roll back the transaction if something goes wrong
    }
    throw error;
  }
};

exports.getAccountById = async (pool, accountId) => {
  try {
    const result = await pool.request()
      .input('account_id', sql.Int, accountId)
      .query('SELECT * FROM accounts WHERE account_id = @account_id');

    if (result.recordset.length === 0) {
      throw new Error('Account not found');
    }

    return result.recordset[0];
  } catch (error) {
    console.error('Error fetching account by ID:', error);
    throw error;
  }
};