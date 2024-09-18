const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const userRoutes = require('./routes/userRoutes'); // Import the user routes

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS

// Database connection configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: { encrypt: true },
  connectionTimeout: 60000,
};

// Connect to the database and set up routes
sql.connect(dbConfig).then(pool => {
  app.set('dbPool', pool); // Make the database pool accessible globally

  // Use user routes for handling login and account creation
  app.use('/users', userRoutes);

  // Start the server
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

}).catch(err => {
  console.error('Database connection failed', err);
});
