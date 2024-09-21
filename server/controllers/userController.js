const sql = require('mssql'); 

const { sendAccountApprovalEmail } = require('../services/emailService');

// login logic
exports.login = async (pool, username, password) => {
  //Old query: SELECT * FROM users 
  //WHERE username = @username AND password_hash = @password
  //Modified 9/20/24 when trying to make sure the role of a user is taken for authorization purposes
  const query = `SELECT username, role_name 
    FROM users 
    JOIN roles ON role_name = role_id 
    WHERE username = @username AND password_hash = @password
  `;
  const result = await pool.request()
    .input('username', sql.VarChar, username)
    .input('password', sql.VarChar, password) 
    //modified line to this to make sure authentication is ran when a user logs in - Ian 9/19/24 
    //Changed it back the next day, commented what I had changed it to
    //'SELECT username, role_name FROM users WHERE username = @username AND password_hash = @password'
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

    //Adding 9/20/2024 - Ian
    //Integrating emailService.js
    try {
      await sendAccountApprovalEmail({
        adminEmail: EMAIL_ADMIN, 
        firstName,
        lastName,
        username,
        email
      });
      console.log('Account approval request sent, awaiting admin approval');
    }
    catch (error) {
      console.error('Error sending account approval request', error);
    }
};
