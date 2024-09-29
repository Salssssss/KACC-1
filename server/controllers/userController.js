const sql = require('mssql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { sendAccountApprovalEmail } = require('../services/emailService');

//helper function to check password age
const isPasswordExpired = (passwordCreatedAt) => {
  const createdDate = new Date(passwordCreatedAt);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  console.log("Password Created At:", passwordCreatedAt);
  console.log("90 Days Ago:", ninetyDaysAgo);
  console.log("Is Password Expired:", createdDate < ninetyDaysAgo);

  return createdDate < ninetyDaysAgo;
};
  // Password validation function
const validatePassword = (password) => {
  const lengthRegex = /^.{8,}$/; // At least 8 characters
  const startWithLetterRegex = /^[A-Za-z]/; // Must start with a letter
  const letterRegex = /[A-Za-z]/; // Must contain a letter
  const numberRegex = /\d/; // Must contain a number
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/; // Must contain a special character

  if (!lengthRegex.test(password)) {
    throw new Error('Password must be at least 8 characters long.');
  }
  if (!startWithLetterRegex.test(password)) {
    throw new Error('Password must start with a letter.');
  }
  if (!letterRegex.test(password) || !numberRegex.test(password) || !specialCharRegex.test(password)) {
    throw new Error('Password must contain at least one letter, one number, and one special character.');
  }
};


//login logic
exports.login = async (pool, username, password) => {
  try {
    // Query to get user info, failed login attempts, and account status
    const userQuery = `
      SELECT u.username, u.user_id, u.failed_login_attempts, u.status, r.role_name
      FROM users u
      JOIN user_roles ur ON u.user_id = ur.user_id
      JOIN roles r ON ur.role_id = r.role_id
      WHERE u.username = @username
    `;

    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .query(userQuery);

    if (result.recordset.length === 0) {
      return { success: false, message: 'Invalid username or password' };
    }

    const user = result.recordset[0];

    // Check if account is suspended
    if (user.status === 'suspended') {
      return { success: false, message: 'Your account is suspended due to too many failed login attempts.' };
    }

    // Query for the current password from user_passwords table
    const passwordQuery = `
      SELECT * FROM user_passwords
      WHERE user_id = @userId AND is_current = 1
    `;
    const passwordResult = await pool.request()
      .input('userId', sql.Int, user.user_id)
      .query(passwordQuery);

    if (passwordResult.recordset.length === 0) {
      return { success: false, message: 'No current password found' };
    }

    const currentPassword = passwordResult.recordset[0];

    // Compare entered password with the hashed password from the database
    const passwordMatch = await bcrypt.compare(password, currentPassword.password_hash);
    if (!passwordMatch) {
      const failedAttempts = user.failed_login_attempts + 1;

      if (failedAttempts >= 3) {
        // Lock the account after 3 failed attempts
        await pool.request()
          .input('userId', sql.Int, user.user_id)
          .query(`UPDATE users SET status = 'suspended', failed_login_attempts = 3 WHERE user_id = @userId`);

        return { success: false, message: 'Your account has been locked due to too many failed login attempts.' };
      }

      // Update the failed login attempts count
      await pool.request()
        .input('userId', sql.Int, user.user_id)
        .input('failedAttempts', sql.Int, failedAttempts)
        .query(`UPDATE users SET failed_login_attempts = @failedAttempts WHERE user_id = @userId`);

      return { success: false, message: 'Invalid username or password' };
    }

    // If login is successful, reset the failed login attempts
    await pool.request()
      .input('userId', sql.Int, user.user_id)
      .query(`UPDATE users SET failed_login_attempts = 0 WHERE user_id = @userId`);

        // Check if the password is older than 90 days
    if (isPasswordExpired(currentPassword.created_at)) {
      return {
        success: true,
        message: 'Your password has expired. Please reset your password.',
        user: user
      };
    }

    // Check if the user has set security questions
    const securityQuestionsQuery = `
      SELECT COUNT(*) AS questionCount
      FROM user_security_questions
      WHERE user_id = @userId
    `;
    const securityResult = await pool.request()
      .input('userId', sql.Int, user.user_id)
      .query(securityQuestionsQuery);

    if (securityResult.recordset[0].questionCount === 0) {
      return {
        success: true,
        message: 'Login successful, but security questions need to be set',
        user: user
      };
    }


    // Login is successful, return user data
    return { 
      success: true,
      message: 'Login successful',
      user: user };

  } catch (error) {
    return { success: false, message: 'Database error', error: error.message };
  }
};



// creating a new account
exports.createAccount = async (pool, userData) => {
  const { firstName, lastName, dob, address, email } = userData;

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

  // Get the new user ID
  const newUserId = insertUserResult.recordset[0].user_id;

  // Assign a default role (e.g., accountant)
  const insertRoleQuery = `
    INSERT INTO user_roles (user_id, role_id)
    VALUES (@userId, 3);  -- Default role 'accountant'
  `;
  await pool.request()
    .input('userId', sql.Int, newUserId)
    .query(insertRoleQuery);

  // Notify the admin to approve the new account
  try {
    await sendAccountApprovalEmail({
      adminEmail: EMAIL_ADMIN,
      firstName,
      lastName,
      username: uniqueUsername, // Send the unique username to the admin
      email
    });
    console.log('Account approval request sent, awaiting admin approval');
  } catch (error) {
    console.error('Error sending account approval request', error);
  }

  return { message: 'Account created successfully. Awaiting admin approval.', userId: newUserId };
};

//logic for creating a password
exports.setPassword = async (pool, userId, newPassword) => {
  // Validate the new password
  try {
    validatePassword(newPassword);
  } catch (error) {
    throw new Error(error.message); // If validation fails, throw an error with the message
  }
  // Check if the user already has a current password
  const checkPasswordQuery = `
    SELECT * FROM user_passwords
    WHERE user_id = @userId AND is_current = 1
  `;
  const checkPasswordResult = await pool.request()
    .input('userId', sql.Int, userId)
    .query(checkPasswordQuery);

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // If the user already has a password, mark the current one as expired
  if (checkPasswordResult.recordset.length > 0) {
    const currentPasswordId = checkPasswordResult.recordset[0].password_id;
    const expirePasswordQuery = `
      UPDATE user_passwords
      SET is_current = 0
      WHERE password_id = @passwordId
    `;
    await pool.request()
      .input('passwordId', sql.Int, currentPasswordId)
      .query(expirePasswordQuery);
  }

  // Insert the new password and mark it as current
  const insertPasswordQuery = `
    INSERT INTO user_passwords (user_id, password_hash, is_current)
    VALUES (@userId, @hashedPassword, 1);
  `;

  await pool.request()
    .input('userId', sql.Int, userId)
    .input('hashedPassword', sql.VarChar, hashedPassword)
    .query(insertPasswordQuery);

  // Optionally, send a confirmation email to the user
  return { message: 'Password set successfully.' };
};

exports.selectSecurityQuestions = async (pool, userId, selectedQuestions) => {

  try {
    // Loop through selected questions, hash the answers, and store them in the database
    for (const question of selectedQuestions) {
      const { questionId, answer } = question;

      // Hash the answer before storing it
      const hashedAnswer = await bcrypt.hash(answer, saltRounds);

      // Insert into user_security_questions table
      const insertQuery = `
        INSERT INTO user_security_questions (user_id, question_id, answer_hash)
        VALUES (@userId, @questionId, @hashedAnswer)
      `;

      await pool.request()
        .input('userId', sql.Int, userId)
        .input('questionId', sql.Int, questionId)
        .input('hashedAnswer', sql.VarChar, hashedAnswer)
        .query(insertQuery);
    }
    return { message: 'Questions set successfully.' };
  } catch (error) {
    console.error('Error saving questions', error);
  }
};

// Function to get security questions from the database
exports.getSecurityQuestions = async (pool) => {
  try {
    const query = `
      SELECT question_id, question_text
      FROM security_questions
    `;

    const result = await pool.request().query(query);

    // Log the result for debugging purposes (optional)
    console.log('Fetched security questions:', result.recordset);

    // Return the final result (recordset), not the whole result object
    return result.recordset; 
  } catch (error) {
    console.error('Error fetching security questions:', error);
    throw error; // Let the error be handled by the router
  }
};











