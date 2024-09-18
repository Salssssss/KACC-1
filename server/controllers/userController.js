const sql = require('mssql');

// login logic
exports.login = async (pool, username, password) => {
  const query = `
    SELECT * FROM users 
    WHERE username = @username AND password_hash = @password
  `;
  const result = await pool.request()
    .input('username', sql.VarChar, username)
    .input('password', sql.VarChar, password) 
    .query(query);

  if (result.recordset.length > 0) {
    return result.recordset[0];
  } else {
    throw new Error('Invalid username or password');
  }
};

// creating a new account
exports.createAccount = async (pool, userData) => {
  const { firstName, lastName, username, password, email } = userData;

  // Check if the username or email already exists
  const checkUserQuery = `
    SELECT * FROM users WHERE username = @username OR email = @Email
  `;
  const checkUserResult = await pool.request()
    .input('username', sql.VarChar, username)
    .input('Email', sql.VarChar, email)
    .query(checkUserQuery);

  if (checkUserResult.recordset.length > 0) {
    throw new Error('Username or email already exists');
  }

  // Insert new user
  const insertUserQuery = `
    INSERT INTO users (first_name, last_name, username, password_hash, email, status, created_at, updated_at)
    VALUES (@firstName, @lastName, @username, @password, @Email, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  await pool.request()
    .input('firstName', sql.VarChar, firstName)
    .input('lastName', sql.VarChar, lastName)
    .input('username', sql.VarChar, username)
    .input('password', sql.VarChar, password) // Store plain text password for now
    .input('Email', sql.VarChar, email)
    .query(insertUserQuery);
};
