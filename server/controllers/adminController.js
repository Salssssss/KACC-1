//Handles requests from admin accounts

//This is a function to fetch the users in the database for the Admin to view them at their dashboard. 
//I wrote the query to only fetch users of account type 'Manager' or 'Accountant'
//I figured if an admin needs to modify their own account it would make more sense to do it elsewhere, we can change this if we want though
exports.fetchUsersByRole = async (pool) => {
    try{
        const userQuery = `
      SELECT u.user_id, u.first_name, u.last_name, u.username, u.email, r.role_name
      FROM users u
      JOIN user_roles ur ON u.user_id = ur.user_id
      JOIN roles r ON ur.role_id = r.role_id
      WHERE r.role_name IN ('Manager', 'Accountant')
    `;

    const result = await pool.request().query(userQuery);

    return { status: 200, users: result.recordset };
    }
    catch (err) {
        console.error('Error fetching users: ', err);
        return { status: 500, message: 'Error fetching users' };
    }
};


//This function is to modify the accounts of accountants and managers
exports.modifyUser = async (pool, userID, updatedData) => {
    const {firstName, lastName, email, role } = updatedData;

    try{
        //This is to update the user's personal info, not their role
        const updateUserQuery = `
      UPDATE users
      SET first_name = @firstName, last_name = @lastName, email = @Email
      WHERE user_id = @userId;
    `;

    await pool.request()
        .input('firstName', sql.VarChar, firstName)
        .input('lastName', sql.VarChar, lastName)
        .input('Email', sql.VarChar, email)
        .input('userID', sql.int, userID)
        .query(updateUserQuery);

    //Update the role seperately, due to the seperate table
    const updateUserRoleQuery = `
      UPDATE user_roles
      SET role_id = (SELECT role_id FROM roles WHERE role_name = @role)
      WHERE user_id = @userId;
    `;

    await pool.request()
        .input('role', sql.VarChar, role)
        .input('userID', sql.int, userID)
        .query(updateUserQuery);

    return {stats: 200, message: 'User updated'};
    }
    catch (err) {
        console.error('Error when updating user info: ', err);
        return {status: 500, message: 'Error when updating user info'};
    }
};