const express = require('express');
const sql = require('mssql');
const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Database connection configuration
const dbConfig = {
  user: 'kacc1', // SQL username
  password: 'Password!', //  SQL password
  server: 'kacc-useast.database.windows.net', //  SQL server
  database: 'KACC', // database name
  options: {
    encrypt: true, 
  },
  connectionTimeout: 60000 //1 minute timeout
};

// Connect to the database
sql.connect(dbConfig).then(pool => {
  // Route to handle login
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
      const result = await pool.request()
        .input('username', sql.VarChar, username)
        .input('password', sql.VarChar, password) 
        .query('SELECT * FROM users WHERE username = @username AND password_hash = @password');

      if (result.recordset.length > 0) {
        res.json({ message: 'Login successful', user: result.recordset[0] });
      } else {
        res.status(401).json({ message: 'Invalid username or password' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Database error' });
    }
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

}).catch(err => {
  console.error('Database connection failed', err);
});
const cors = require('cors');
app.use(cors());

app.post('/create-account', async (req, res) => {
  const { firstName, lastName, username, password, email } = req.body;

  if (!firstName || !lastName || !username || !password || !email) {
      return res.status(400).json({ message: 'All fields are required' });
  }

  try {
      // Hash the password (WIP)
      const hashedPassword = password;

      // Connect to the database
      const pool = await sql.connect(dbConfig);

      // Check if the username or email already exists
      const checkUserQuery = `
          SELECT * FROM users WHERE username = @username OR email = @Email
      `;
      const checkUserResult = await pool
          .request()
          .input('username', sql.VarChar, username)
          .input('Email', sql.VarChar, email)
          .query(checkUserQuery);

      if (checkUserResult.recordset.length > 0) {
          return res.status(400).json({ message: 'Username or email already exists' });
      }

      // Insert the new user into the database
      const insertUserQuery = `
          INSERT INTO users (first_name, last_name, username, password_hash, email, status, created_at, updated_at)
          VALUES (@firstName, @lastName, @username, @hashedPassword, @Email, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;

      await pool
          .request()
          .input('firstName', sql.VarChar, firstName)
          .input('lastName', sql.VarChar, lastName)
          .input('username', sql.VarChar, username)
          .input('hashedPassword', sql.VarChar, hashedPassword)
          .input('Email', sql.VarChar, email)
          .query(insertUserQuery);

      res.status(201).json({ message: 'Account created successfully' });

  } catch (error) {
      console.error('Error creating account:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});
