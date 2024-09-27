//This script is for the different routes designated for admin users only
//https://stackoverflow.com/questions/54852786/how-to-create-an-admin-and-allow-access-to-admin-panel-in-node-js

const express = require('express');
const router = express.Router();
//const { authorizeUser } = require('../middleware/authorizationMiddleware')
const { fetchUsersByRole, modifyUser, createUser, getReportOfAllUsers, getReportOfExpiredPasswords } = require('../controllers/adminController')


  

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
    try{
        const {userID } = req.params;
        const result = await modifyUser(req.pool, userID, req.body);
        res.status(result.status).json(result);
    }
    catch(err){
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

module.exports = router;

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

