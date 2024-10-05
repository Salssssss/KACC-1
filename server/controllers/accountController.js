const sql = require('mssql');
exports.createAccount = async (pool, accountData) => {
    const {
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
    } = accountData;

    try {
        // Use pool.request() to interact with the database
        await pool.request()
            .input('account_name', sql.VarChar, account_name)
            .input('account_number', sql.VarChar, account_number)
            .input('account_description', sql.VarChar, account_description)
            .input('normal_side', sql.VarChar, normal_side)
            .input('category', sql.VarChar, category)
            .input('subcategory', sql.VarChar, subcategory)
            .input('initial_balance', sql.Decimal(15, 2), initial_balance)
            .input('user_id', sql.Int, user_id)
            .input('order', sql.Int, order) 
            .input('statement', sql.VarChar, statement)
            .query(`INSERT INTO accounts 
                    (account_name, account_number, account_description, normal_side, category, subcategory, initial_balance, user_id, [order], statement, created_at, updated_at)
                    VALUES (@account_name, @account_number, @account_description, @normal_side, @category, @subcategory, @initial_balance, @user_id, @order, @statement, GETDATE(), GETDATE())`);
    } catch (error) {
        console.error('Error during account creation:', error);
        throw error;
    }
};

  