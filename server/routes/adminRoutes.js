//This script is for the different routes designated for admin users only
//https://stackoverflow.com/questions/54852786/how-to-create-an-admin-and-allow-access-to-admin-panel-in-node-js

const express = require('express');
const router = express.Router();
const { authorizeUser } = require('../middleware/authorizationMiddleware')

//Route for looking at all users(this should come after pulling up the admin dashboard, not sure how to differentiate admin dashboard from current dashboard we have)
router.get('/users', authorizeUser, async (req, res) => {
    try{
        const pool = req.app.get('dbpool');
        const result = await pool.request().query('SELECT * FROM users');
        res.json(result.recordset);
    }
    catch (err){
        res.status(500).json({ message: 'Error when fetching users' });
    }
});


module.exports = router;