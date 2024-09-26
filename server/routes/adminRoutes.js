//This script is for the different routes designated for admin users only
//https://stackoverflow.com/questions/54852786/how-to-create-an-admin-and-allow-access-to-admin-panel-in-node-js

const express = require('express');
const router = express.Router();
const { authorizeUser } = require('../middleware/authorizationMiddleware')
const { fetchUsersByRole, modifyUser } = require('../controllers/adminController')


//Route for looking at all users (accountants and managers)
//Calls the function in adminController
router.get('/users-by-role', authorizeUser, async (req, res) => {
    try{
        const result = await fetchUsersByRole(req.pool);
        res.status(result.status).json(result);
    }
    catch (err){
        res.status(500).json({ message: 'Error when fetching users' });
    }
});

//Route for modifying user data from the admin dashboard
router.put('/modify-user/:userID', authorizeUser, async (req, res) => {
    try{
        const {userID } = req.params;
        const result = await modifyUser(req.pool, userID, req.body);
        res.status(result.status).json(result);
    }
    catch(err){
        res.status(500).json({ message: 'Error modifying user' });
    }
});

module.exports = router;