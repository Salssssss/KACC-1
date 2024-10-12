const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const sql = require('mssql');
const bcrypt = require('bcrypt');

// Transporter for Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SENDGRID_HOST, // smtp.sendgrid.net
  port: process.env.SENDGRID_PORT, // 587 (TLS)
  secure: false, // Use TLS, not SSL
  auth: {
    user: process.env.SENDGRID_USERNAME, // 'apikey' (always)
    pass: process.env.SENDGRID_API_KEY, // Your SendGrid API key
  },
});

const { 
  login, 
  createAccount, 
  setPassword, 
  selectSecurityQuestions, 
  getSecurityQuestions
} = require('../controllers/userController');

// Route for user login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const pool = req.app.get('dbPool'); // Use the shared DB pool

  try {
    const result = await login(pool, username, password);
    const user = result.user;

    // Store user information in the session
    if (result.success === true || result.success === 'true') {
      req.session.user = {
        id: user.user_id,
        role_name: user.role_name,
      };
    }
    

    // Save the session and respond to the client only once
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(600).send('Session could not be saved'); 
      }

      res.json(result);
    });

  } catch (error) {
    console.error('Login error:', error);
    console.log(error.response.data.message)
    // Forwarding the error message if available
    if (error.response && error.response.data) {
        res.status(401).json({ message: error.response.data.message });
    } else {
        // Fallback error handling
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
}
});


// Route for creating a new account
router.post('/create-account', async (req, res) => {
  const pool = req.app.get('dbPool'); // Use the shared DB pool
  try {
    await createAccount(pool, req.body);
    res.status(201).json({ message: 'Account created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route for setting or resetting a password
router.post('/set-password', async (req, res) => {
  const pool = req.app.get('dbPool'); 
  const { userId, newPassword } = req.body; // The request body should contain the userId and the new password

  try {
    await setPassword(pool, userId, newPassword);
    res.status(200).json({ message: 'Password set successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//route for getting security questions from databasse
router.get('/security-questions', async (req, res) => {
  const pool = req.app.get('dbPool');

  try {
    const result = await getSecurityQuestions(pool); // The result from the controller is already the final data (not recordset)

    // Respond with the list of security questions
    res.status(200).json(result); // Just send the result, as it is already the final recordset from the controller
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error('Error fetching security questions:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});



// Route to select and answer security questions after setting a password
router.post('/select-security-questions', async (req, res) => {
  const { userId, selectedQuestions } = req.body;
    // Validate input
    if (!userId || !Array.isArray(selectedQuestions) || selectedQuestions.length !== 2) {
      return res.status(400).json({ message: 'Invalid input. You must select two security questions.' });
    }
  const pool = req.app.get('dbPool'); 

  try {
    await selectSecurityQuestions(pool, userId, selectedQuestions);
    res.status(200).json({ message: 'Question set succesfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//forgot password route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const pool = req.app.get('dbPool');

  try {
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT user_id, email FROM users WHERE email = @email');

    if (result.recordset.length > 0) {
      const user = result.recordset[0];

      // Check if the user has security questions set
      const questionsResult = await pool.request()
        .input('userId', sql.Int, user.user_id)
        .query(`
          SELECT sq.question_id, q.question_text
          FROM user_security_questions sq
          JOIN security_questions q ON sq.question_id = q.question_id
          WHERE sq.user_id = @userId
        `);

      if (questionsResult.recordset.length > 0) {
        // Return security questions if they exist
        return res.status(200).json({
          success: true,
          securityQuestions: questionsResult.recordset,
          userId: user.user_id
        });
      } else {
        res.status(400).json({message: 'No security questions set for this account'});
      }
    } else {
      res.status(400).json({ message: 'No account associated with this email.' });
    }
  } catch (error) {
    console.error('Error processing forgot password:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});



//route for verifying security questions
router.post('/verify-security-answers', async (req, res) => {
  const { userId, answers } = req.body;
  const pool = req.app.get('dbPool');

  try {
    let allCorrect = true;

    // Loop through each answer and check against the hashed values in the database
    for (const questionId in answers) {
      const plainTextAnswer = answers[questionId];

      // Fetch the hashed answer from the database
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('questionId', sql.Int, questionId)
        .query(`
          SELECT answer_hash
          FROM user_security_questions
          WHERE user_id = @userId AND question_id = @questionId
        `);

      if (result.recordset.length === 0) {
        allCorrect = false; // No answer found for the question
        break;
      }

      const storedHash = result.recordset[0].answer_hash;

      // Use bcrypt to compare the provided answer with the stored hash
      const isMatch = await bcrypt.compare(plainTextAnswer, storedHash);

      if (!isMatch) {
        allCorrect = false; // If any answer doesn't match, mark as incorrect
        break;
      }
    }

    if (allCorrect) {
      // Security answers are correct, send the reset email
      const userResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT email FROM users WHERE user_id = @userId');
      
      const user = userResult.recordset[0];

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const resetLink = `http://localhost:3000/set-password?userId=${userId}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Password Reset Request',
        text: `You answered the security questions correctly. Please use the following link to reset your password: ${resetLink}`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Error sending email:', err);
          return res.status(500).json({ message: 'Error sending reset email.' });
        }

        return res.status(200).json({
          success: true,
          message: 'Security answers verified. Password reset link has been sent to your email.',
        });
      });
    } else {
      return res.status(400).json({ success: false, message: 'Incorrect answers to security questions.' });
    }
  } catch (error) {
    console.error('Error verifying security answers:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
