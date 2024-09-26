//This script is for the different routes designated for admin users only
//https://stackoverflow.com/questions/54852786/how-to-create-an-admin-and-allow-access-to-admin-panel-in-node-js

const express = require('express');
const router = express.Router();
//const { authorizeUser } = require('../middleware/authorizationMiddleware')
const { fetchUsersByRole, modifyUser } = require('../controllers/adminController')


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
  console.log('Session in admin route:', req.session);
  try{
        const result = await fetchUsersByRole(req.pool);
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

module.exports = router;




/*router.get('/users-by-role', authorizationMiddleware, (req, res) => {
    if (req.session && req.session.user) {
      const userRole = req.session.user.role_name;
      
      if (userRole === 'administrator') {
        // Fetch and return users by role from the database
        const query = 'SELECT * FROM users';
        db.query(query, (err, results) => {
          if (err) {
            return res.status(500).json({ message: 'Error fetching users' });
          }
          res.json({ users: results });
        });
      } else {
        return res.status(403).json({ message: 'Access forbidden: Insufficient privileges' });
      }
    } else {
      return res.status(403).json({ message: 'No valid session found' });
    }
  });
  */
/**/