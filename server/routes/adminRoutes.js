//This script is for the different routes designated for admin users only
//https://stackoverflow.com/questions/54852786/how-to-create-an-admin-and-allow-access-to-admin-panel-in-node-js

const express = require('express');
const router = express.Router();
//const { authorizeUser } = require('../middleware/authorizationMiddleware')
const { sendEmail } = require('../services/emailService'); 
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

//Route for admin to send an email for a user
router.post('/send-email', authorizationMiddleware, async (req, res) => {
  const { senderEmail, receiverEmail, subject, body } = req.body; 
  try {
    //Send the email using the sendEmail function
    sendEmail(senderEmail, receiverEmail, subject, body);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
});


module.exports = router;
