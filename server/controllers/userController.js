const sql = require('mssql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { sendAccountApprovalEmail } = require('../services/emailService');

const EMAIL_ADMIN = "KACCTest9282024@outlook.com";  // Admin email

// Helper function to check password age
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

// Login logic
exports.login = async (pool, username, password) => {
  const userQuery = `
    SELECT u.username, u.user_id, u.failed_login_attempts, u.status, u.profile_picture, r.role_name
    FROM users u
    JOIN user_roles ur ON u.user_id = ur.user_id
    JOIN roles r ON ur.role_id = r.role_id
    WHERE u.username = @username
  `;

  const result = await pool.request()
    .input('username', sql.VarChar, username)
    .query(userQuery);

  if (result.recordset.length > 0) {
    const user = result.recordset[0];

    if (user.status === 'suspended') {
      throw new Error('Your account is suspended due to too many failed login attempts.');
    }

    const passwordQuery = `
      SELECT * FROM user_passwords
      WHERE user_id = @userId AND is_current = 1
    `;
    const passwordResult = await pool.request()
      .input('userId', sql.Int, user.user_id)
      .query(passwordQuery);

    if (passwordResult.recordset.length > 0) {
      const currentPassword = passwordResult.recordset[0];
      const passwordMatch = await bcrypt.compare(password, currentPassword.password_hash);

      if (!passwordMatch) {
        const failedAttempts = user.failed_login_attempts + 1;

        if (failedAttempts >= 3) {
          await pool.request()
            .input('userId', sql.Int, user.user_id)
            .query(`UPDATE users SET status = 'suspended', failed_login_attempts = 3 WHERE user_id = @userId`);

          throw new Error('Your account has been locked due to too many failed login attempts.');
        } else {
          await pool.request()
            .input('userId', sql.Int, user.user_id)
            .input('failedAttempts', sql.Int, failedAttempts)
            .query(`UPDATE users SET failed_login_attempts = @failedAttempts WHERE user_id = @userId`);

          throw new Error('Invalid username or password');
        }
      }

      await pool.request()
        .input('userId', sql.Int, user.user_id)
        .query(`UPDATE users SET failed_login_attempts = 0 WHERE user_id = @userId`);

      if (isPasswordExpired(currentPassword.created_at)) {
        throw new Error('Your password has expired. Please reset your password.');
      }

      return { user };
    } else {
      throw new Error('No current password found');
    }
  } else {
    throw new Error('Invalid username or password');
  }
};

// Creating a new account
exports.createAccount = async (pool, userData) => {
  const { firstName, lastName, dob, address, email } = userData;

  const currentDate = new Date();
  const monthYear = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getFullYear().toString().slice(-2)}`;
  let username = `${firstName[0].toLowerCase()}${lastName.toLowerCase()}${monthYear}`;
  let uniqueUsername = username;

  let suffix = 1;
  let isUnique = false;

  while (!isUnique) {
    const checkUserQuery = `
      SELECT COUNT(*) AS count FROM users WHERE username = @username
    `;
    const checkUserResult = await pool.request()
      .input('username', sql.VarChar, uniqueUsername)
      .query(checkUserQuery);

    if (checkUserResult.recordset[0].count > 0) {
      uniqueUsername = `${username}${suffix}`;
      suffix += 1;
    } else {
      isUnique = true;
    }
  }

  const insertUserQuery = `
    INSERT INTO users (first_name, last_name, username, email, date_of_birth, address, status)
    VALUES (@firstName, @lastName, @uniqueUsername, @Email, @dob, @address, 'pending');
    SELECT SCOPE_IDENTITY() AS user_id;
  `;

  const insertUserResult = await pool.request()
    .input('firstName', sql.VarChar, firstName)
    .input('lastName', sql.VarChar, lastName)
    .input('uniqueUsername', sql.VarChar, uniqueUsername)
    .input('Email', sql.VarChar, email)
    .input('dob', sql.Date, dob)
    .input('address', sql.VarChar, address)
    .query(insertUserQuery);

  const newUserId = insertUserResult.recordset[0].user_id;

  const insertRoleQuery = `
    INSERT INTO user_roles (user_id, role_id)
    VALUES (@userId, 3);
  `;
  await pool.request()
    .input('userId', sql.Int, newUserId)
    .query(insertRoleQuery);

  try {
    await sendAccountApprovalEmail({
      adminEmail: EMAIL_ADMIN,
      firstName,
      lastName,
      username: uniqueUsername,
      email
    });
    console.log('Account approval request sent, awaiting admin approval');
  } catch (error) {
    console.error('Error sending account approval request', error);
  }

  return { message: 'Account created successfully. Awaiting admin approval.', userId: newUserId };
};

// Logic for creating a password
exports.setPassword = async (pool, userId, newPassword) => {
  try {
    validatePassword(newPassword);
  } catch (error) {
    throw new Error(error.message);
  }

  const checkPasswordQuery = `
    SELECT * FROM user_passwords
    WHERE user_id = @userId AND is_current = 1
  `;
  const checkPasswordResult = await pool.request()
    .input('userId', sql.Int, userId)
    .query(checkPasswordQuery);

  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

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

  const insertPasswordQuery = `
    INSERT INTO user_passwords (user_id, password_hash, is_current)
    VALUES (@userId, @hashedPassword, 1);
  `;

  await pool.request()
    .input('userId', sql.Int, userId)
    .input('hashedPassword', sql.VarChar, hashedPassword)
    .query(insertPasswordQuery);

  return { message: 'Password set successfully.' };
};
