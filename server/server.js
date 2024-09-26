const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const userRoutes = require('./routes/userRoutes'); // Import the user routes
const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors({
  //allows requests from the frontend
  origin: 'http://localhost:3000',
  //allows cookies and sessions to be sent
  credentials: true
})); // Enable CORS

//Make sure admin routes are included
const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

const sessionMiddleware = require('./middleware/sessionMiddleware');
app.use(sessionMiddleware);

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

  // Add a simple GET route for the root URL
  app.get('/', (req, res) => {
    res.send('API is running');
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

}).catch(err => {
  console.error('Database connection failed:', err);
});
