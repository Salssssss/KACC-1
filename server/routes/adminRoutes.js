//This script is for the different routes designated for admin users only
//https://stackoverflow.com/questions/54852786/how-to-create-an-admin-and-allow-access-to-admin-panel-in-node-js

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: process.env.SENDGRID_HOST, // smtp.sendgrid.net
  port: process.env.SENDGRID_PORT, // 587 (TLS)
  secure: false, // Use TLS, not SSL
  auth: {
    user: process.env.SENDGRID_USERNAME, // 'apikey' (always)
    pass: process.env.SENDGRID_API_KEY, // Your SendGrid API key
  },
});

//const { authorizeUser } = require('../middleware/authorizationMiddleware')
const { 
  fetchUsersByRole, 
  modifyUser, 
  createUser, 
  getReportOfAllUsers, 
  getReportOfExpiredPasswords, 
  activateOrDeactivateUser, 
  suspendUser 
} = require('../controllers/adminController');


  

//Check if user is admin
const authorizationMiddleware = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role_name === 'administrator') {
        return next();
    }
    else {
        return res.status(403).json({ message: 'Access deinied: insufficient privileges '});
    }
};

//Route for looking at all users (accountants and managers)
//Calls the function in adminController
router.get('/users-by-role', authorizationMiddleware, async (req, res) => {
  
  try{
        const pool = req.app.get('dbPool');
        const result = await fetchUsersByRole(pool);
        res.status(result.status).json(result);
    }
    catch (err){
        res.status(500).json({ message: 'Error when fetching users' });
    }
});

//Route for modifying user data from the admin dashboard
router.put('/modify-user/:userID', authorizationMiddleware, async (req, res) => {
  console.log('Request Params:', req.params);
  console.log('Request Body:', req.body);
  try {
      const pool = req.app.get('dbPool');  
      const { userID } = req.params;       
      const result = await modifyUser(pool, userID, req.body);  
      res.status(result.status).json(result);  
  } catch (err) {
      console.error('Error modifying user:', err);
      res.status(500).json({ message: 'Error modifying user' });
  }
});


//Route for creating a new account from the admin dashboard
router.post('/create-user', authorizationMiddleware, async (req, res) => {
  const pool = req.app.get('dbPool');
  try{
    const result = await createUser(pool, req.body);
    res.status(result.status).json(result);
  }
  catch(error){
    console.error('Error in create-user route: ', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

//Route for getting all the users for report
router.get('/get-report-of-users', authorizationMiddleware, async (req, res) => {
  try{
    const pool = req.app.get('dbPool');
    const result = await getReportOfAllUsers(pool);
    res.status(result.status).json(result);
}
catch (err){
    res.status(500).json({ message: 'Error when generating report' });
}
});

//Route for getting expired passwords for report
router.get('/get-report-of-passwords', authorizationMiddleware, async (req, res) => {
  try{
    const pool = req.app.get('dbPool');
    const result = await getReportOfExpiredPasswords(pool);
    res.status(result.status).json(result);
}
catch (err){
    res.status(500).json({ message: 'Error when generating report' });
}
});


//Route for updating user status
router.put('/activate-or-deactivate-user/:userID', authorizationMiddleware, async (req, res) => {
  try {
    console.log('Request to activate or deactivate user:', req.params.userID, req.body.status);
    //Status sent from the frontend 
    const { status } = req.body; 
    const userID = req.params.userID;
    const pool = req.app.get('dbPool');

    const result = await activateOrDeactivateUser(pool, userID, status);
    console.log('Status updated in the DB:', result);
    res.status(result.status).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});

//Route for suspending a user for a set amount of time
router.put('/suspend-user/:userID', authorizationMiddleware, async (req, res) => {
  try {
    //Get start and end dates from request body
    const { suspensionStart, suspensionEnd } = req.body; 
    const userID = req.params.userID;
    const pool = req.app.get('dbPool');

    const result = await suspendUser(pool, userID, suspensionStart, suspensionEnd);
    res.status(result.status).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error suspending user' });
  }
});

router.post('/send-activation-email', async (req, res) => {
  const { userId, email, uniqueUsername } = req.body;

  try {
    const resetLink = `http://localhost:3000/set-password?userId=${userId}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Account Activation - Set Your Password',
      text: `Your account has been activated. Your username is ${uniqueUsername}Your user ID is ${userId} save this if you need torecover your account. Please use the following link to set your password: ${resetLink}`,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Activation email sent' });
  } catch (error) {
    console.error('Error sending activation email:', error);
    res.status(500).json({ message: 'Error sending activation email' });
  }
});

router.post('/send-email', async (req, res) => {
  const { userEmail, subject, message } = req.body;

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: subject,
      text: message,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email.' });
      }
      res.status(200).json({ message: 'Email sent successfully.' });
    });
  } catch (error) {
    console.error('Error processing email request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
