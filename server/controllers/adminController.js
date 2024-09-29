//Handles requests from admin accounts

//This is a function to fetch the users in the database for the Admin to view them at their dashboard. 
//I wrote the query to only fetch users of account type 'Manager' or 'Accountant'
//I figured if an admin needs to modify their own account it would make more sense to do it elsewhere, we can change this if we want though
const sql = require('mssql');

exports.fetchUsersByRole = async (pool) => {
        const userQuery = `
      SELECT u.user_id, u.first_name, u.last_name, u.username, u.email, u.status, r.role_name
      FROM users u
      JOIN user_roles ur ON u.user_id = ur.user_id
      JOIN roles r ON ur.role_id = r.role_id
      WHERE r.role_name IN ('Manager', 'Accountant')
    `;
    try{
    const result = await pool.request()
    .query(userQuery);

    return { status: 200, users: result.recordset };
    }
    catch (err) {
        console.error('Error fetching users: ', err);
        return { status: 500, message: 'Error fetching users' };
    }
};


//This function is to modify the accounts of accountants and managers
exports.modifyUser = async (pool, userID, updatedData) => {
    const {firstName, lastName, username, email, role } = updatedData;

    try{
        //This is to update the user's personal info, not their role
        const updateUserQuery = `
      UPDATE users
      SET first_name = @firstName, last_name = @lastName, email = @Email
      WHERE user_id = @userId;
    `;

    await pool.request()
        .input('firstName', sql.VarChar, firstName)
        .input('lastName', sql.VarChar, lastName)
        .input('Email', sql.VarChar, email)
        .input('userId', sql.Int, userID)
        .query(updateUserQuery);

    //Update the role seperately, due to the seperate table
    const updateUserRoleQuery = `
      UPDATE user_roles
      SET role_id = (SELECT role_id FROM roles WHERE role_name = @role)
      WHERE user_id = @userId;
    `;

    await pool.request()
        .input('role', sql.VarChar, role)
        .input('userID', sql.Int, userID)
        .query(updateUserRoleQuery);

    return {status: 200, message: 'User updated'};
    }
    catch (err) {
        console.error('Error when updating user info: ', err);
        return {status: 500, message: 'Error when updating user info'};
    }
};

//Create a user from the admin page
exports.createUser = async (pool, userData) => {
  const { firstName, lastName, username, email, role } = userData;

  try {
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
    const createUserQuery = `
      INSERT INTO users (first_name, last_name, username, email)
      VALUES (@firstName, @lastName, @username, @Email);
      SELECT SCOPE_IDENTITY() AS user_id;  -- Get the newly inserted user_id
    `;

    const result = await pool.request()
      .input('firstName', sql.VarChar, firstName)
      .input('lastName', sql.VarChar, lastName)
      .input('username', sql.VarChar, username)
      .input('Email', sql.VarChar, email)
      .query(createUserQuery);

    const userId = result.recordset[0].user_id; // Correct way to get the user ID

    // Insert role for the new user
    const assignRoleQuery = `
      INSERT INTO user_roles (user_id, role_id)
      VALUES (@userId, (SELECT role_id FROM roles WHERE role_name = @role));
    `;

    await pool.request()
      .input('userId', sql.Int, userId)
      .input('role', sql.VarChar, role)
      .query(assignRoleQuery);

    return { status: 201, message: 'User created successfully' };
  } catch (error) {
    console.error('Error creating user: ', error);
    return { status: 500, message: 'Error creating user' };
  }
};


exports.getReportOfAllUsers = async (pool) => {
  try {
    const query = `
      SELECT *
      FROM users;
    `;

    const result = await pool.request().query(query);
    return { status: 200, users: result.recordset };
  }
  catch (error) {
    console.error('Error fetching users: ', error);
    return { status: 500, message: 'Error fetching users' };
  }
};

exports.getReportOfExpiredPasswords = async(pool) => {
  try{
    const query = `
    SELECT u.user_id, u.first_name, u.last_name, up.created_at
      FROM users u
      JOIN user_passwords up ON u.user_id = up.user_id
      WHERE up.is_current = 0
      
  `;
  
  const result = await pool.query(query);
  return { status: 200, expiredPasswords: result.recordset };
  }
  catch (error){
    console.error('Error fetching expired passwords: ', error);
    return { status: 500, message: 'Error fetching expired passwords' };
  }
};

//This is for activating/deactivating an account
//I want to handle the suspension requirement in its own method, so that way it's easier to set it from a start date to an end date - Ian
exports.activateOrDeactivateUser = async (pool, userID, status) => {
  try {
    const query = `
      UPDATE users
      SET status = @status
      WHERE user_id = @userID;
    `;

    const request = pool.request();
    request.input('status', status);
    request.input('userID', userID);
    
    await request.query(query);

    return { status: 200, message: 'User status updated successfully' };
  } catch (error) {
    console.error('Error updating user status: ', error);
    return { status: 500, message: 'Error updating user status' };
  }
};

//Suspending a user for a set amount of time
exports.suspendUser = async (pool, userID, suspensionStart, suspensionEnd) => {
  try {
    const query = `
      UPDATE users
      SET status = 'suspended', suspension_start_date = @suspensionStart, suspension_end_date = @suspensionEnd
      WHERE user_id = @userID;
    `;

    const request = pool.request();
    request.input('suspensionStart', suspensionStart);
    request.input('suspensionEnd', suspensionEnd);
    request.input('userID', userID);
    
    await request.query(query);

    return { status: 200, message: 'User suspended successfully' };
  } catch (error) {
    console.error('Error suspending user: ', error);
    return { status: 500, message: 'Error suspending user' };
  }
};






