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
  const { firstName, lastName, dob, address, email, role } = userData;

  try {
    // Generate the base username: first initial + full last name + MMYY
    const currentDate = new Date();
    const monthYear = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getFullYear().toString().slice(-2)}`;
    let username = `${firstName[0].toLowerCase()}${lastName.toLowerCase()}${monthYear}`;
    let uniqueUsername = username;

    // Check if the base username already exists and increment the number until a unique one is found
    let suffix = 1; // Start incrementing from 1
    let isUnique = false;

    while (!isUnique) {
      const checkUserQuery = `
        SELECT COUNT(*) AS count FROM users WHERE username = @username
      `;
      const checkUserResult = await pool.request()
        .input('username', sql.VarChar, uniqueUsername)
        .query(checkUserQuery);

      if (checkUserResult.recordset[0].count > 0) {
        // Username exists, increment the suffix and try again
        uniqueUsername = `${username}${suffix}`;
        suffix += 1;
      } else {
        // Username is unique, exit the loop
        isUnique = true;
      }
    }

    // Insert new user with the unique username (without password, pending activation by admin)
    const insertUserQuery = `
      INSERT INTO users (first_name, last_name, username, email, date_of_birth, address, status)
      VALUES (@firstName, @lastName, @uniqueUsername, @Email, @dob, @address, 'pending');
      SELECT SCOPE_IDENTITY() AS user_id;  -- Get the newly inserted user_id
    `;

    const insertUserResult = await pool.request()
      .input('firstName', sql.VarChar, firstName)
      .input('lastName', sql.VarChar, lastName)
      .input('uniqueUsername', sql.VarChar, uniqueUsername)
      .input('Email', sql.VarChar, email)
      .input('dob', sql.Date, dob)
      .input('address', sql.VarChar, address)
      .query(insertUserQuery);

    // Correct way to get the user ID
    const userId = insertUserResult.recordset[0].user_id;

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

//Getting the emails for the email list
exports.getEmails = async () => {
  try {
    
    // Query the database for emails
    const query = `SELECT email FROM Users`;

    const request = pool.request();
  
    await request.query(query);
      const result = await mssql.query`SELECT email FROM Users`; // Replace 'Users' with your table name

  } catch (error) {
      console.error("Error fetching emails:", error);
      res.status(500).send("Error fetching emails");
  }
};






